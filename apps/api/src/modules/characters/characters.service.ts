import { and, eq, inArray, sql } from "drizzle-orm";
import type { BetterSQLiteTransaction } from "drizzle-orm/better-sqlite3";
import { HTTPException } from "hono/http-exception";
import type { Db } from "../../db/client.ts";
import {
  backgroundDetails,
  characterBackgroundChoices,
  characterClassChoices,
  characterClassSelections,
  characterFeats,
  characterItems,
  characterSkillProficiencies,
  characterSpeciesChoices,
  characterToolProficiencies,
  characters,
  characterSpells,
  classChoiceGroups,
  classChoiceOptions,
  classes,
  classLevels,
  items,
  spellClasses,
  spells,
  speciesChoiceGroups,
  speciesChoiceOptions,
  relations,
} from "../../db/schema.ts";
import type { BackgroundAbilityScore } from "../../db/schema.ts";
import { GAMING_SET_PLACEHOLDER, toolCategories } from "../../shared/tool-categories.ts";
import type {
  BackgroundChoices,
  ClassChoices,
  CreateCharacter,
  UpdateCharacter,
} from "./characters.schema.ts";

type Transaction = BetterSQLiteTransaction<typeof relations>;
type Reader = Pick<Db, "select">;
type SpeciesChoice = { choiceGroupId: number; choiceOptionId: number };
type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";
type Scores = Record<AbilityKey, number>;
type ResolvedBackground = {
  details: typeof backgroundDetails.$inferSelect;
  choices: BackgroundChoices;
  tool: string;
};
type ResolvedClass = {
  cls: typeof classes.$inferSelect;
  choices: ClassChoices;
  featureChoices: SpeciesChoice[];
  goldGranted: number;
  spellRows: { spellId: number; prepared: boolean }[];
};

const abilityKeys: Record<BackgroundAbilityScore, AbilityKey> = {
  Strength: "str",
  Dexterity: "dex",
  Constitution: "con",
  Intelligence: "int",
  Wisdom: "wis",
  Charisma: "cha",
};
const MAX_ABILITY_SCORE = 20;
const BACKGROUND_SOURCE = "background";
const CLASS_SOURCE = "class";
const GOLD_OPTION = "gold";

function isForeignKeyError(err: unknown): boolean {
  const e = err as { code?: string; cause?: { code?: string } };
  return (e?.code ?? e?.cause?.code) === "SQLITE_CONSTRAINT_FOREIGNKEY";
}

export class CharactersService {
  private readonly db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  list() {
    return this.db
      .select()
      .from(characters)
      .orderBy(characters.id)
      .all()
      .map((character) => ({
        ...character,
        ...this.getExtras(this.db, character.id),
      }));
  }

  get(id: number) {
    const row = this.db.select().from(characters).where(eq(characters.id, id)).get();
    if (!row) throw new HTTPException(404, { message: "Character not found" });
    return { ...row, ...this.getExtras(this.db, id) };
  }

  create(input: CreateCharacter) {
    try {
      return this.db.transaction((tx) => {
        const { speciesChoices = [], backgroundChoices, classChoices, ...characterInput } = input;
        this.validateSpeciesChoices(tx, characterInput.speciesId, speciesChoices);
        const background = this.resolveBackground(
          tx,
          characterInput.backgroundId,
          backgroundChoices,
        );
        const characterClass = this.resolveClass(
          tx,
          characterInput.classId,
          classChoices,
          background?.details.skillProficiencies ?? [],
        );
        const scores = background
          ? this.applyAbilityIncreases(characterInput, background)
          : undefined;
        const character = tx
          .insert(characters)
          .values({ ...characterInput, ...scores })
          .returning()
          .get();
        if (!character) throw new Error("Character insert returned no row");
        this.saveSpeciesChoices(tx, character.id, speciesChoices);
        if (background) this.saveBackground(tx, character.id, background);
        this.saveClass(tx, character.id, characterClass);
        return this.getWithChoices(tx, character.id);
      });
    } catch (err) {
      throw this.mapError(err);
    }
  }

  update(id: number, input: UpdateCharacter) {
    try {
      return this.db.transaction((tx) => {
        const current = tx.select().from(characters).where(eq(characters.id, id)).get();
        if (!current) throw new HTTPException(404, { message: "Character not found" });

        const { speciesChoices, backgroundChoices, classChoices, ...characterInput } = input;
        const speciesId = characterInput.speciesId ?? current.speciesId;
        const replaceChoices = speciesId !== current.speciesId || speciesChoices !== undefined;
        const choices = speciesChoices ?? [];
        if (replaceChoices) this.validateSpeciesChoices(tx, speciesId, choices);

        const backgroundChanged =
          characterInput.backgroundId !== undefined &&
          characterInput.backgroundId !== current.backgroundId;
        if (backgroundChoices && !backgroundChanged) {
          throw new HTTPException(400, {
            message: "Background choices can only be sent when changing the background",
          });
        }
        const background = backgroundChanged
          ? this.resolveBackground(tx, characterInput.backgroundId!, backgroundChoices)
          : null;
        const classChanged =
          characterInput.classId !== undefined && characterInput.classId !== current.classId;
        if (classChanged && !classChoices) {
          throw new HTTPException(400, {
            message: "Class choices are required when changing the class",
          });
        }
        const replaceClass = classChanged || classChoices !== undefined;
        const backgroundSkills = backgroundChanged
          ? (background?.details.skillProficiencies ?? [])
          : this.readSkills(tx, id);
        const characterClass = replaceClass
          ? this.resolveClass(
              tx,
              characterInput.classId ?? current.classId,
              classChoices,
              backgroundSkills,
            )
          : null;
        if (backgroundChanged && !replaceClass) {
          this.assertClassSkillsAvailable(tx, id, backgroundSkills);
        }
        const scores = background
          ? this.applyAbilityIncreases({ ...current, ...characterInput }, background)
          : undefined;

        const updated = tx
          .update(characters)
          .set({ ...characterInput, ...scores })
          .where(eq(characters.id, id))
          .returning()
          .get();
        if (!updated) throw new HTTPException(404, { message: "Character not found" });
        if (replaceChoices) this.saveSpeciesChoices(tx, id, choices);
        if (backgroundChanged) {
          this.clearBackground(tx, id);
          if (background) this.saveBackground(tx, id, background);
        }
        if (characterClass) {
          this.clearClass(tx, id);
          this.saveClass(tx, id, characterClass);
        }
        return this.getWithChoices(tx, id);
      });
    } catch (err) {
      throw this.mapError(err);
    }
  }

  remove(id: number) {
    this.db.transaction((tx) => {
      tx.delete(characterItems).where(eq(characterItems.characterId, id)).run();
      tx.delete(characterSpells).where(eq(characterSpells.characterId, id)).run();
      tx.delete(characterSpeciesChoices).where(eq(characterSpeciesChoices.characterId, id)).run();
      tx.delete(characterClassChoices).where(eq(characterClassChoices.characterId, id)).run();
      tx.delete(characterClassSelections).where(eq(characterClassSelections.characterId, id)).run();
      tx.delete(characterBackgroundChoices)
        .where(eq(characterBackgroundChoices.characterId, id))
        .run();
      tx.delete(characterFeats).where(eq(characterFeats.characterId, id)).run();
      tx.delete(characterSkillProficiencies)
        .where(eq(characterSkillProficiencies.characterId, id))
        .run();
      tx.delete(characterToolProficiencies)
        .where(eq(characterToolProficiencies.characterId, id))
        .run();
      const deleted = tx.delete(characters).where(eq(characters.id, id)).returning().all();
      if (deleted.length === 0) throw new HTTPException(404, { message: "Character not found" });
    });
  }

  private resolveBackground(
    tx: Transaction,
    backgroundId: number,
    choices: BackgroundChoices | undefined,
  ): ResolvedBackground | null {
    const details = tx
      .select()
      .from(backgroundDetails)
      .where(eq(backgroundDetails.backgroundId, backgroundId))
      .get();
    if (!details) {
      if (choices) throw this.invalidBackgroundChoices("This background has no choices to make");
      return null;
    }
    if (!choices) throw this.invalidBackgroundChoices("Background choices are required");

    const increases = choices.abilityIncreases;
    if (increases.mode === "split") {
      const allowed = details.abilityScores;
      if (
        increases.plusTwo === increases.plusOne ||
        !allowed.includes(increases.plusTwo) ||
        !allowed.includes(increases.plusOne)
      ) {
        throw this.invalidBackgroundChoices(
          "Ability increases must use two different abilities offered by the background",
        );
      }
    }

    const proficiency = details.toolProficiency;
    let tool: string;
    if (proficiency.type === "specific") {
      if (choices.toolChoice !== undefined) {
        throw this.invalidBackgroundChoices("This background does not offer a tool choice");
      }
      tool = proficiency.name;
    } else {
      const allowedTools = toolCategories[proficiency.category] ?? [];
      if (!choices.toolChoice || !allowedTools.includes(choices.toolChoice)) {
        throw this.invalidBackgroundChoices(
          `Choose a valid ${proficiency.category} for the tool proficiency`,
        );
      }
      tool = choices.toolChoice;
    }

    return { details, choices, tool };
  }

  private applyAbilityIncreases(current: Scores, background: ResolvedBackground): Scores {
    const { details, choices } = background;
    const increases = choices.abilityIncreases;
    const bonus: Partial<Scores> =
      increases.mode === "split"
        ? { [abilityKeys[increases.plusTwo]]: 2, [abilityKeys[increases.plusOne]]: 1 }
        : Object.fromEntries(details.abilityScores.map((ability) => [abilityKeys[ability], 1]));

    const next = { ...current };
    for (const key of Object.keys(bonus) as AbilityKey[]) {
      next[key] = current[key] + (bonus[key] ?? 0);
      if (next[key] > MAX_ABILITY_SCORE) {
        throw this.invalidBackgroundChoices(
          `Ability increases cannot raise a score above ${MAX_ABILITY_SCORE}`,
        );
      }
    }
    return {
      str: next.str,
      dex: next.dex,
      con: next.con,
      int: next.int,
      wis: next.wis,
      cha: next.cha,
    };
  }

  private saveBackground(tx: Transaction, characterId: number, background: ResolvedBackground) {
    const { details, choices, tool } = background;
    const useGold = choices.equipment === "gold";
    const goldGranted = useGold
      ? details.equipment.alternative.amount
      : details.equipment.package.gold;
    const increases = choices.abilityIncreases;

    tx.insert(characterBackgroundChoices)
      .values({
        characterId,
        abilityMode: increases.mode,
        plusTwo: increases.mode === "split" ? increases.plusTwo : null,
        plusOne: increases.mode === "split" ? increases.plusOne : null,
        equipmentOption: choices.equipment,
        goldGranted,
      })
      .run();
    tx.insert(characterFeats).values({ characterId, feat: details.feat }).run();
    tx.insert(characterSkillProficiencies)
      .values(details.skillProficiencies.map((skill) => ({ characterId, skill })))
      .run();
    tx.insert(characterToolProficiencies).values({ characterId, tool }).run();
    tx.update(characters)
      .set({ gold: sql`${characters.gold} + ${goldGranted}` })
      .where(eq(characters.id, characterId))
      .run();

    if (useGold) return;
    const entries = details.equipment.package.items.map((entry) => ({
      name: entry.item === GAMING_SET_PLACEHOLDER ? tool : entry.item,
      quantity: entry.quantity,
    }));
    const rows = tx
      .select({ id: items.id, name: items.name })
      .from(items)
      .where(
        inArray(
          items.name,
          entries.map((entry) => entry.name),
        ),
      )
      .all();
    tx.insert(characterItems)
      .values(
        entries.map((entry) => {
          const item = rows.find((row) => row.name === entry.name);
          if (!item) throw new Error(`Missing item for background equipment: ${entry.name}`);
          return {
            characterId,
            itemId: item.id,
            quantity: entry.quantity,
            source: BACKGROUND_SOURCE,
          };
        }),
      )
      .run();
  }

  private clearBackground(tx: Transaction, characterId: number) {
    const previous = tx
      .select()
      .from(characterBackgroundChoices)
      .where(eq(characterBackgroundChoices.characterId, characterId))
      .get();
    if (previous) {
      tx.update(characters)
        .set({ gold: sql`max(${characters.gold} - ${previous.goldGranted}, 0)` })
        .where(eq(characters.id, characterId))
        .run();
    }
    tx.delete(characterItems)
      .where(
        and(
          eq(characterItems.characterId, characterId),
          eq(characterItems.source, BACKGROUND_SOURCE),
        ),
      )
      .run();
    tx.delete(characterBackgroundChoices)
      .where(eq(characterBackgroundChoices.characterId, characterId))
      .run();
    tx.delete(characterFeats).where(eq(characterFeats.characterId, characterId)).run();
    tx.delete(characterSkillProficiencies)
      .where(eq(characterSkillProficiencies.characterId, characterId))
      .run();
    tx.delete(characterToolProficiencies)
      .where(eq(characterToolProficiencies.characterId, characterId))
      .run();
  }

  private resolveClass(
    tx: Transaction,
    classId: number,
    choices: ClassChoices | undefined,
    backgroundSkills: string[],
  ): ResolvedClass {
    const cls = tx.select().from(classes).where(eq(classes.id, classId)).get();
    if (!cls) throw new HTTPException(400, { message: "Unknown species, background or class" });
    if (!choices) throw this.invalidClassChoices("Class choices are required");

    const unique = (values: string[]) => new Set(values).size === values.length;
    const skills = choices.skills;
    if (
      skills.length !== cls.skillChoiceCount ||
      !unique(skills) ||
      skills.some((skill) => !cls.skillChoiceOptions.includes(skill))
    ) {
      throw this.invalidClassChoices(
        `Choose ${cls.skillChoiceCount} different class skills from the offered list`,
      );
    }
    if (skills.some((skill) => backgroundSkills.includes(skill))) {
      throw this.invalidClassChoices("Class skills cannot repeat skills granted by the background");
    }

    const tools = choices.tools ?? [];
    const allowedTools = cls.toolChoice ? (toolCategories[cls.toolChoice.category] ?? []) : [];
    if (
      tools.length !== (cls.toolChoice?.count ?? 0) ||
      !unique(tools) ||
      tools.some((tool) => !allowedTools.includes(tool))
    ) {
      throw this.invalidClassChoices(
        cls.toolChoice
          ? `Choose ${cls.toolChoice.count} different ${cls.toolChoice.category} proficiencies`
          : "This class does not offer a tool choice",
      );
    }

    const expertise = choices.expertise ?? [];
    const expertiseOptions = [...backgroundSkills, ...skills, ...cls.toolProficiencies];
    if (
      expertise.length !== cls.expertiseCount ||
      !unique(expertise) ||
      expertise.some((entry) => !expertiseOptions.includes(entry))
    ) {
      throw this.invalidClassChoices(
        `Choose ${cls.expertiseCount} different proficiencies for Expertise`,
      );
    }

    const masteries = choices.weaponMasteries ?? [];
    if (masteries.length !== cls.weaponMasteryCount || !unique(masteries)) {
      throw this.invalidClassChoices(
        `Choose ${cls.weaponMasteryCount} different weapons for Weapon Mastery`,
      );
    }

    const featureChoices = choices.featureChoices ?? [];
    const extraCantrips = this.validateClassFeatureChoices(tx, classId, featureChoices);

    const levelOne = tx
      .select()
      .from(classLevels)
      .where(and(eq(classLevels.classId, classId), eq(classLevels.level, 1)))
      .get();
    const cantripCount = Number(levelOne?.columns.Cantrips ?? 0) + extraCantrips;
    const preparedCount = Number(levelOne?.columns["Prepared Spells"] ?? 0);
    const spellRows = this.validateSpells(tx, cls, {
      cantrips: choices.cantrips ?? [],
      spellbook: choices.spellbook ?? [],
      prepared: choices.preparedSpells ?? [],
      cantripCount,
      preparedCount,
    });

    let goldGranted: number;
    if (choices.equipment === GOLD_OPTION) {
      goldGranted = cls.startingEquipment.goldAlternative;
    } else {
      const equipmentPackage = cls.startingEquipment.packages[choices.equipment];
      if (!equipmentPackage) {
        throw this.invalidClassChoices("Choose a valid starting equipment option");
      }
      goldGranted = equipmentPackage.gold;
    }

    return { cls, choices, featureChoices, goldGranted, spellRows };
  }

  private validateSpells(
    tx: Transaction,
    cls: typeof classes.$inferSelect,
    input: {
      cantrips: number[];
      spellbook: number[];
      prepared: number[];
      cantripCount: number;
      preparedCount: number;
    },
  ) {
    const { cantrips, spellbook, prepared, cantripCount, preparedCount } = input;
    const hasSpellbook = cls.spellbookCount > 0;
    const unique = (values: number[]) => new Set(values).size === values.length;
    const check = (ids: number[], count: number, label: string) => {
      if (ids.length !== count || !unique(ids)) {
        throw this.invalidClassChoices(`Choose ${count} different ${label}`);
      }
    };
    check(cantrips, cantripCount, "cantrips");
    check(prepared, preparedCount, "prepared spells");
    if (hasSpellbook) {
      check(spellbook, cls.spellbookCount, "spellbook spells");
      if (prepared.some((id) => !spellbook.includes(id))) {
        throw this.invalidClassChoices("Prepared spells must come from the spellbook");
      }
    } else if (spellbook.length > 0) {
      throw this.invalidClassChoices("This class does not have a spellbook");
    }

    const all = [...new Set([...cantrips, ...spellbook, ...prepared])];
    if (all.length === 0) return [];
    const onList = tx
      .select({ id: spells.id, level: spells.level })
      .from(spells)
      .innerJoin(spellClasses, eq(spellClasses.spellId, spells.id))
      .where(and(eq(spellClasses.classId, cls.id), inArray(spells.id, all)))
      .all();
    const levels = new Map(onList.map((spell) => [spell.id, spell.level]));
    if (cantrips.some((id) => levels.get(id) !== 0)) {
      throw this.invalidClassChoices("Choose cantrips from the class spell list");
    }
    if ([...spellbook, ...prepared].some((id) => levels.get(id) !== 1)) {
      throw this.invalidClassChoices("Choose level 1 spells from the class spell list");
    }

    const preparedIds = new Set([...cantrips, ...prepared]);
    const learned = hasSpellbook ? [...cantrips, ...spellbook] : [...cantrips, ...prepared];
    return learned.map((spellId) => ({ spellId, prepared: preparedIds.has(spellId) }));
  }

  // Returns the extra cantrips granted by the chosen options
  private validateClassFeatureChoices(
    tx: Transaction,
    classId: number,
    choices: SpeciesChoice[],
  ): number {
    const groups = tx
      .select()
      .from(classChoiceGroups)
      .where(and(eq(classChoiceGroups.classId, classId), eq(classChoiceGroups.level, 1)))
      .all();
    let extraCantrips = 0;
    for (const group of groups) {
      const selected = choices
        .filter((choice) => choice.choiceGroupId === group.id)
        .map((choice) => choice.choiceOptionId);
      const options =
        selected.length === 0
          ? []
          : tx
              .select()
              .from(classChoiceOptions)
              .where(
                and(
                  eq(classChoiceOptions.choiceGroupId, group.id),
                  inArray(classChoiceOptions.id, selected),
                ),
              )
              .all();
      if (
        selected.length !== group.choiceCount ||
        new Set(selected).size !== selected.length ||
        options.length !== selected.length
      ) {
        throw this.invalidClassChoices(`Choose a valid option for ${group.name}`);
      }
      extraCantrips += options.reduce((total, option) => total + option.extraCantrips, 0);
    }
    if (choices.length !== groups.reduce((total, group) => total + group.choiceCount, 0)) {
      throw this.invalidClassChoices("Feature choices must match the class choice groups");
    }
    return extraCantrips;
  }

  private saveClass(tx: Transaction, characterId: number, resolved: ResolvedClass) {
    const { cls, choices, featureChoices, goldGranted, spellRows } = resolved;
    tx.insert(characterClassSelections)
      .values({
        characterId,
        equipmentOption: choices.equipment,
        goldGranted,
        skills: choices.skills,
        tools: choices.tools ?? [],
        expertise: choices.expertise ?? [],
        weaponMasteries: choices.weaponMasteries ?? [],
      })
      .run();
    if (spellRows.length > 0) {
      tx.insert(characterSpells)
        .values(spellRows.map((row) => ({ characterId, ...row })))
        .run();
    }
    if (featureChoices.length > 0) {
      tx.insert(characterClassChoices)
        .values(featureChoices.map((choice) => ({ characterId, ...choice })))
        .run();
    }
    tx.update(characters)
      .set({ gold: sql`${characters.gold} + ${goldGranted}` })
      .where(eq(characters.id, characterId))
      .run();

    if (choices.equipment === GOLD_OPTION) return;
    const entries = cls.startingEquipment.packages[choices.equipment]!.items;
    const rows = tx
      .select({ id: items.id, name: items.name })
      .from(items)
      .where(
        inArray(
          items.name,
          entries.map((entry) => entry.item),
        ),
      )
      .all();
    tx.insert(characterItems)
      .values(
        entries.map((entry) => {
          const item = rows.find((row) => row.name === entry.item);
          if (!item) throw new Error(`Missing item for class equipment: ${entry.item}`);
          return {
            characterId,
            itemId: item.id,
            quantity: entry.quantity,
            source: CLASS_SOURCE,
          };
        }),
      )
      .run();
  }

  private clearClass(tx: Transaction, characterId: number) {
    const previous = tx
      .select()
      .from(characterClassSelections)
      .where(eq(characterClassSelections.characterId, characterId))
      .get();
    if (previous) {
      tx.update(characters)
        .set({ gold: sql`max(${characters.gold} - ${previous.goldGranted}, 0)` })
        .where(eq(characters.id, characterId))
        .run();
    }
    tx.delete(characterItems)
      .where(
        and(eq(characterItems.characterId, characterId), eq(characterItems.source, CLASS_SOURCE)),
      )
      .run();
    tx.delete(characterClassChoices)
      .where(eq(characterClassChoices.characterId, characterId))
      .run();
    tx.delete(characterSpells).where(eq(characterSpells.characterId, characterId)).run();
    tx.delete(characterClassSelections)
      .where(eq(characterClassSelections.characterId, characterId))
      .run();
  }

  private readSkills(reader: Reader, characterId: number): string[] {
    return reader
      .select({ skill: characterSkillProficiencies.skill })
      .from(characterSkillProficiencies)
      .where(eq(characterSkillProficiencies.characterId, characterId))
      .all()
      .map((row) => row.skill);
  }

  private assertClassSkillsAvailable(tx: Transaction, characterId: number, taken: string[]) {
    const selection = tx
      .select({ skills: characterClassSelections.skills })
      .from(characterClassSelections)
      .where(eq(characterClassSelections.characterId, characterId))
      .get();
    if (selection?.skills.some((skill) => taken.includes(skill))) {
      throw this.invalidClassChoices(
        "The new background repeats a class skill; send classChoices to choose again",
      );
    }
  }

  private invalidClassChoices(message: string) {
    return new HTTPException(400, { message });
  }

  private invalidBackgroundChoices(message: string) {
    return new HTTPException(400, { message });
  }

  private validateSpeciesChoices(
    tx: Transaction,
    speciesId: number,
    choices: SpeciesChoice[],
  ): void {
    const groups = tx
      .select()
      .from(speciesChoiceGroups)
      .where(eq(speciesChoiceGroups.speciesId, speciesId))
      .all();

    for (const group of groups) {
      const selectedOptions = choices
        .filter((choice) => choice.choiceGroupId === group.id)
        .map((choice) => choice.choiceOptionId);
      if (
        selectedOptions.length !== group.choiceCount ||
        new Set(selectedOptions).size !== selectedOptions.length
      ) {
        throw this.invalidSpeciesChoices();
      }

      const validOptions =
        selectedOptions.length === 0
          ? []
          : tx
              .select({ id: speciesChoiceOptions.id })
              .from(speciesChoiceOptions)
              .where(
                and(
                  eq(speciesChoiceOptions.choiceGroupId, group.id),
                  inArray(speciesChoiceOptions.id, selectedOptions),
                ),
              )
              .all();
      if (validOptions.length !== selectedOptions.length) throw this.invalidSpeciesChoices();
    }

    if (choices.length !== groups.reduce((total, group) => total + group.choiceCount, 0)) {
      throw this.invalidSpeciesChoices();
    }
  }

  private saveSpeciesChoices(tx: Transaction, characterId: number, choices: SpeciesChoice[]) {
    tx.delete(characterSpeciesChoices)
      .where(eq(characterSpeciesChoices.characterId, characterId))
      .run();
    if (choices.length > 0) {
      tx.insert(characterSpeciesChoices)
        .values(choices.map((choice) => ({ characterId, ...choice })))
        .run();
    }
  }

  private getWithChoices(tx: Transaction, id: number) {
    const row = tx.select().from(characters).where(eq(characters.id, id)).get();
    if (!row) throw new HTTPException(404, { message: "Character not found" });
    return { ...row, ...this.getExtras(tx, id) };
  }

  private getExtras(reader: Reader, characterId: number) {
    const speciesChoices = reader
      .select({
        choiceGroupId: characterSpeciesChoices.choiceGroupId,
        choiceOptionId: characterSpeciesChoices.choiceOptionId,
      })
      .from(characterSpeciesChoices)
      .where(eq(characterSpeciesChoices.characterId, characterId))
      .orderBy(characterSpeciesChoices.choiceGroupId, characterSpeciesChoices.choiceOptionId)
      .all();
    const backgroundChoices =
      reader
        .select({
          abilityMode: characterBackgroundChoices.abilityMode,
          plusTwo: characterBackgroundChoices.plusTwo,
          plusOne: characterBackgroundChoices.plusOne,
          equipmentOption: characterBackgroundChoices.equipmentOption,
          goldGranted: characterBackgroundChoices.goldGranted,
        })
        .from(characterBackgroundChoices)
        .where(eq(characterBackgroundChoices.characterId, characterId))
        .get() ?? null;
    const feats = reader
      .select({ feat: characterFeats.feat })
      .from(characterFeats)
      .where(eq(characterFeats.characterId, characterId))
      .orderBy(characterFeats.feat)
      .all()
      .map((row) => row.feat);
    const skillProficiencies = reader
      .select({ skill: characterSkillProficiencies.skill })
      .from(characterSkillProficiencies)
      .where(eq(characterSkillProficiencies.characterId, characterId))
      .orderBy(characterSkillProficiencies.skill)
      .all()
      .map((row) => row.skill);
    const toolProficiencies = reader
      .select({ tool: characterToolProficiencies.tool })
      .from(characterToolProficiencies)
      .where(eq(characterToolProficiencies.characterId, characterId))
      .orderBy(characterToolProficiencies.tool)
      .all()
      .map((row) => row.tool);
    const inventory = reader
      .select({
        itemId: items.id,
        name: items.name,
        quantity: characterItems.quantity,
        source: characterItems.source,
      })
      .from(characterItems)
      .innerJoin(items, eq(items.id, characterItems.itemId))
      .where(eq(characterItems.characterId, characterId))
      .orderBy(items.name)
      .all();
    const classSelection =
      reader
        .select()
        .from(characterClassSelections)
        .where(eq(characterClassSelections.characterId, characterId))
        .get() ?? null;
    const classFeatureChoices = reader
      .select({
        choiceGroupId: characterClassChoices.choiceGroupId,
        choiceOptionId: characterClassChoices.choiceOptionId,
      })
      .from(characterClassChoices)
      .where(eq(characterClassChoices.characterId, characterId))
      .orderBy(characterClassChoices.choiceGroupId, characterClassChoices.choiceOptionId)
      .all();
    const classChoices = classSelection
      ? {
          equipmentOption: classSelection.equipmentOption,
          goldGranted: classSelection.goldGranted,
          skills: classSelection.skills,
          tools: classSelection.tools,
          expertise: classSelection.expertise,
          weaponMasteries: classSelection.weaponMasteries,
          featureChoices: classFeatureChoices,
        }
      : null;
    const characterSpellRows = reader
      .select({
        spellId: spells.id,
        name: spells.name,
        level: spells.level,
        school: spells.school,
        prepared: characterSpells.prepared,
      })
      .from(characterSpells)
      .innerJoin(spells, eq(spells.id, characterSpells.spellId))
      .where(eq(characterSpells.characterId, characterId))
      .orderBy(spells.level, spells.name)
      .all();
    const sorted = (values: string[]) => [...new Set(values)].sort();
    return {
      speciesChoices,
      backgroundChoices,
      classChoices,
      feats,
      skillProficiencies: sorted([...skillProficiencies, ...(classSelection?.skills ?? [])]),
      toolProficiencies: sorted([...toolProficiencies, ...(classSelection?.tools ?? [])]),
      inventory,
      spells: characterSpellRows,
    };
  }

  private invalidSpeciesChoices() {
    return new HTTPException(400, {
      message:
        "Species choices must include the required number of valid options for every choice group",
    });
  }

  private mapError(err: unknown) {
    if (err instanceof HTTPException) return err;
    if (isForeignKeyError(err)) {
      return new HTTPException(400, { message: "Unknown species, background or class" });
    }
    return err;
  }
}
