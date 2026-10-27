import { and, eq, inArray } from "drizzle-orm";
import type { BetterSQLiteTransaction } from "drizzle-orm/better-sqlite3";
import { HTTPException } from "hono/http-exception";
import type { Db } from "../../db/client.ts";
import {
  characterItems,
  characterSpeciesChoices,
  characters,
  characterSpells,
  speciesChoiceGroups,
  speciesChoiceOptions,
  relations,
} from "../../db/schema.ts";
import type { CreateCharacter, UpdateCharacter } from "./characters.schema.ts";

type Transaction = BetterSQLiteTransaction<typeof relations>;
type SpeciesChoice = { choiceGroupId: number; choiceOptionId: number };

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
        speciesChoices: this.getSelections(character.id),
      }));
  }

  get(id: number) {
    const row = this.db.select().from(characters).where(eq(characters.id, id)).get();
    if (!row) throw new HTTPException(404, { message: "Character not found" });
    return { ...row, speciesChoices: this.getSelections(id) };
  }

  create(input: CreateCharacter) {
    try {
      return this.db.transaction((tx) => {
        const { speciesChoices = [], ...characterInput } = input;
        this.validateSpeciesChoices(tx, characterInput.speciesId, speciesChoices);
        const character = tx.insert(characters).values(characterInput).returning().get();
        if (!character) throw new Error("Character insert returned no row");
        this.saveSpeciesChoices(tx, character.id, speciesChoices);
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

        const { speciesChoices, ...characterInput } = input;
        const speciesId = characterInput.speciesId ?? current.speciesId;
        const replaceChoices = speciesId !== current.speciesId || speciesChoices !== undefined;
        const choices = speciesChoices ?? [];
        if (replaceChoices) this.validateSpeciesChoices(tx, speciesId, choices);

        const updated = tx
          .update(characters)
          .set(characterInput)
          .where(eq(characters.id, id))
          .returning()
          .get();
        if (!updated) throw new HTTPException(404, { message: "Character not found" });
        if (replaceChoices) this.saveSpeciesChoices(tx, id, choices);
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
      const deleted = tx.delete(characters).where(eq(characters.id, id)).returning().all();
      if (deleted.length === 0) throw new HTTPException(404, { message: "Character not found" });
    });
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
    const speciesChoices = tx
      .select({
        choiceGroupId: characterSpeciesChoices.choiceGroupId,
        choiceOptionId: characterSpeciesChoices.choiceOptionId,
      })
      .from(characterSpeciesChoices)
      .where(eq(characterSpeciesChoices.characterId, id))
      .orderBy(characterSpeciesChoices.choiceGroupId, characterSpeciesChoices.choiceOptionId)
      .all();
    return { ...row, speciesChoices };
  }

  private getSelections(characterId: number) {
    return this.db
      .select({
        choiceGroupId: characterSpeciesChoices.choiceGroupId,
        choiceOptionId: characterSpeciesChoices.choiceOptionId,
      })
      .from(characterSpeciesChoices)
      .where(eq(characterSpeciesChoices.characterId, characterId))
      .orderBy(characterSpeciesChoices.choiceGroupId, characterSpeciesChoices.choiceOptionId)
      .all();
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
