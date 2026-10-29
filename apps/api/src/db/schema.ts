import { defineRelations, sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const features = sqliteTable("features", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  actionCost: integer("action_cost"),
  uses: integer("uses"),
});

export const species = sqliteTable("species", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
});

export const backgrounds = sqliteTable("backgrounds", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
});

export type BackgroundAbilityScore =
  | "Strength"
  | "Dexterity"
  | "Constitution"
  | "Intelligence"
  | "Wisdom"
  | "Charisma";

export type BackgroundToolProficiency =
  | { type: "specific"; name: string }
  | { type: "choice"; category: string };

export type BackgroundEquipment = {
  package: { items: { item: string; quantity: number }[]; gold: number };
  alternative: { amount: number; currency: "GP" };
};

export const backgroundDetails = sqliteTable("background_details", {
  backgroundId: integer("background_id")
    .primaryKey()
    .references(() => backgrounds.id),
  abilityScores: text("ability_scores", { mode: "json" })
    .$type<BackgroundAbilityScore[]>()
    .notNull(),
  feat: text("feat").notNull(),
  skillProficiencies: text("skill_proficiencies", { mode: "json" }).$type<string[]>().notNull(),
  toolProficiency: text("tool_proficiency", { mode: "json" })
    .$type<BackgroundToolProficiency>()
    .notNull(),
  equipment: text("equipment", { mode: "json" }).$type<BackgroundEquipment>().notNull(),
});

export type ClassEquipmentPackage = {
  items: { item: string; quantity: number }[];
  gold: number;
};

export type ClassStartingEquipment = {
  packages: Record<string, ClassEquipmentPackage>;
  goldAlternative: number;
};

export type ClassToolChoice = { count: number; category: string };
export type ClassLevelColumns = Record<string, string | number>;
export type ClassEquipmentOption = string;

export const classes = sqliteTable("classes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  hitPointDie: integer("hit_point_die").notNull(),
  primaryAbility: text("primary_ability").notNull().default(""),
  savingThrows: text("saving_throws", { mode: "json" })
    .$type<BackgroundAbilityScore[]>()
    .notNull()
    .default([]),
  armorTraining: text("armor_training", { mode: "json" }).$type<string[]>().notNull().default([]),
  weaponProficiencies: text("weapon_proficiencies", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .default([]),
  toolProficiencies: text("tool_proficiencies", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .default([]),
  toolChoice: text("tool_choice", { mode: "json" }).$type<ClassToolChoice | null>(),
  skillChoiceCount: integer("skill_choice_count").notNull().default(0),
  skillChoiceOptions: text("skill_choice_options", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .default([]),
  expertiseCount: integer("expertise_count").notNull().default(0),
  weaponMasteryCount: integer("weapon_mastery_count").notNull().default(0),
  spellbookCount: integer("spellbook_count").notNull().default(0),
  spellcastingAbility: text("spellcasting_ability").$type<BackgroundAbilityScore | null>(),
  startingEquipment: text("starting_equipment", { mode: "json" })
    .$type<ClassStartingEquipment>()
    .notNull()
    .default({ packages: {}, goldAlternative: 0 }),
});

export const subclasses = sqliteTable("subclasses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  classId: integer("class_id")
    .notNull()
    .references(() => classes.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
});

export const classLevels = sqliteTable(
  "class_levels",
  {
    classId: integer("class_id")
      .notNull()
      .references(() => classes.id),
    level: integer("level").notNull(),
    proficiencyBonus: integer("proficiency_bonus").notNull(),
    columns: text("columns", { mode: "json" }).$type<ClassLevelColumns>().notNull(),
    spellSlots: text("spell_slots", { mode: "json" }).$type<number[] | null>(),
  },
  (table) => [
    primaryKey({ columns: [table.classId, table.level] }),
    check("class_levels_level_range", sql`${table.level} between 1 and 20`),
  ],
);

export const classFeatures = sqliteTable("class_features", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  classId: integer("class_id")
    .notNull()
    .references(() => classes.id),
  subclassId: integer("subclass_id").references(() => subclasses.id),
  level: integer("level").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
});

export const classChoiceGroups = sqliteTable(
  "class_choice_groups",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    classId: integer("class_id")
      .notNull()
      .references(() => classes.id),
    level: integer("level").notNull().default(1),
    name: text("name").notNull(),
    description: text("description").notNull(),
    choiceCount: integer("choice_count").notNull().default(1),
  },
  (table) => [check("class_choice_groups_choice_count_positive", sql`${table.choiceCount} > 0`)],
);

export const classChoiceOptions = sqliteTable(
  "class_choice_options",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    choiceGroupId: integer("choice_group_id")
      .notNull()
      .references(() => classChoiceGroups.id),
    name: text("name").notNull(),
    description: text("description").notNull(),
    extraCantrips: integer("extra_cantrips").notNull().default(0),
  },
  (table) => [uniqueIndex("class_choice_options_group_id_id").on(table.choiceGroupId, table.id)],
);

export const items = sqliteTable("items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  weight: real("weight"),
});

export const spells = sqliteTable("spells", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  level: integer("level").notNull(),
  school: text("school").notNull(),
  castingTime: text("casting_time").notNull().default(""),
  range: text("range").notNull().default(""),
  components: text("components", { mode: "json" }).$type<string[]>().notNull().default([]),
  material: text("material"),
  duration: text("duration").notNull().default(""),
  concentration: integer("concentration", { mode: "boolean" }).notNull().default(false),
  ritual: integer("ritual", { mode: "boolean" }).notNull().default(false),
  higherLevel: text("higher_level"),
});

export const spellClasses = sqliteTable(
  "spell_classes",
  {
    spellId: integer("spell_id")
      .notNull()
      .references(() => spells.id),
    classId: integer("class_id")
      .notNull()
      .references(() => classes.id),
  },
  (table) => [primaryKey({ columns: [table.spellId, table.classId] })],
);

export const speciesToFeatures = sqliteTable(
  "species_to_features",
  {
    specieId: integer("specie_id")
      .notNull()
      .references(() => species.id),
    featureId: integer("feature_id")
      .notNull()
      .references(() => features.id),
  },
  (table) => [primaryKey({ columns: [table.specieId, table.featureId] })],
);

export const speciesChoiceGroups = sqliteTable(
  "species_choice_groups",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    speciesId: integer("species_id")
      .notNull()
      .references(() => species.id),
    name: text("name").notNull(),
    description: text("description").notNull(),
    choiceCount: integer("choice_count").notNull().default(1),
  },
  (table) => [check("species_choice_groups_choice_count_positive", sql`${table.choiceCount} > 0`)],
);

export const speciesChoiceOptions = sqliteTable(
  "species_choice_options",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    choiceGroupId: integer("choice_group_id")
      .notNull()
      .references(() => speciesChoiceGroups.id),
    name: text("name").notNull(),
    description: text("description").notNull(),
  },
  (table) => [uniqueIndex("species_choice_options_group_id_id").on(table.choiceGroupId, table.id)],
);

export const speciesChoiceOptionToFeatures = sqliteTable(
  "species_choice_option_to_features",
  {
    choiceGroupId: integer("choice_group_id").notNull(),
    choiceOptionId: integer("choice_option_id").notNull(),
    featureId: integer("feature_id")
      .notNull()
      .references(() => features.id),
  },
  (table) => [
    primaryKey({ columns: [table.choiceGroupId, table.choiceOptionId, table.featureId] }),
    foreignKey({
      columns: [table.choiceGroupId, table.choiceOptionId],
      foreignColumns: [speciesChoiceOptions.choiceGroupId, speciesChoiceOptions.id],
    }),
  ],
);

export const characters = sqliteTable("characters", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  level: integer("level", { mode: "number" }).default(1),
  speciesId: integer("species_id")
    .notNull()
    .references(() => species.id),
  backgroundId: integer("background_id")
    .notNull()
    .references(() => backgrounds.id),
  classId: integer("class_id")
    .notNull()
    .references(() => classes.id),
  str: integer("str").notNull().default(10),
  dex: integer("dex").notNull().default(10),
  con: integer("con").notNull().default(10),
  int: integer("int").notNull().default(10),
  wis: integer("wis").notNull().default(10),
  cha: integer("cha").notNull().default(10),
  gold: integer("gold").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export type BackgroundAbilityMode = "split" | "even";
export type BackgroundEquipmentOption = "package" | "gold";

export const characterBackgroundChoices = sqliteTable("character_background_choices", {
  characterId: integer("character_id")
    .primaryKey()
    .references(() => characters.id),
  abilityMode: text("ability_mode").$type<BackgroundAbilityMode>().notNull(),
  plusTwo: text("plus_two").$type<BackgroundAbilityScore>(),
  plusOne: text("plus_one").$type<BackgroundAbilityScore>(),
  equipmentOption: text("equipment_option").$type<BackgroundEquipmentOption>().notNull(),
  goldGranted: integer("gold_granted").notNull().default(0),
});

export const characterClassSelections = sqliteTable("character_class_selections", {
  characterId: integer("character_id")
    .primaryKey()
    .references(() => characters.id),
  equipmentOption: text("equipment_option").$type<ClassEquipmentOption>().notNull(),
  goldGranted: integer("gold_granted").notNull().default(0),
  skills: text("skills", { mode: "json" }).$type<string[]>().notNull(),
  tools: text("tools", { mode: "json" }).$type<string[]>().notNull(),
  expertise: text("expertise", { mode: "json" }).$type<string[]>().notNull(),
  weaponMasteries: text("weapon_masteries", { mode: "json" }).$type<string[]>().notNull(),
});

export const characterSubclasses = sqliteTable("character_subclasses", {
  characterId: integer("character_id")
    .primaryKey()
    .references(() => characters.id),
  subclassId: integer("subclass_id")
    .notNull()
    .references(() => subclasses.id),
});

export const characterClassChoices = sqliteTable(
  "character_class_choices",
  {
    characterId: integer("character_id")
      .notNull()
      .references(() => characters.id),
    choiceGroupId: integer("choice_group_id")
      .notNull()
      .references(() => classChoiceGroups.id),
    choiceOptionId: integer("choice_option_id").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.characterId, table.choiceGroupId, table.choiceOptionId] }),
    foreignKey({
      columns: [table.choiceGroupId, table.choiceOptionId],
      foreignColumns: [classChoiceOptions.choiceGroupId, classChoiceOptions.id],
    }),
  ],
);

export const characterFeats = sqliteTable(
  "character_feats",
  {
    characterId: integer("character_id")
      .notNull()
      .references(() => characters.id),
    feat: text("feat").notNull(),
  },
  (table) => [primaryKey({ columns: [table.characterId, table.feat] })],
);

export const characterSkillProficiencies = sqliteTable(
  "character_skill_proficiencies",
  {
    characterId: integer("character_id")
      .notNull()
      .references(() => characters.id),
    skill: text("skill").notNull(),
  },
  (table) => [primaryKey({ columns: [table.characterId, table.skill] })],
);

export const characterToolProficiencies = sqliteTable(
  "character_tool_proficiencies",
  {
    characterId: integer("character_id")
      .notNull()
      .references(() => characters.id),
    tool: text("tool").notNull(),
  },
  (table) => [primaryKey({ columns: [table.characterId, table.tool] })],
);

export const characterSpeciesChoices = sqliteTable(
  "character_species_choices",
  {
    characterId: integer("character_id")
      .notNull()
      .references(() => characters.id),
    choiceGroupId: integer("choice_group_id")
      .notNull()
      .references(() => speciesChoiceGroups.id),
    choiceOptionId: integer("choice_option_id").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.characterId, table.choiceGroupId, table.choiceOptionId] }),
    foreignKey({
      columns: [table.choiceGroupId, table.choiceOptionId],
      foreignColumns: [speciesChoiceOptions.choiceGroupId, speciesChoiceOptions.id],
    }),
  ],
);

export const characterItems = sqliteTable(
  "character_items",
  {
    characterId: integer("character_id")
      .notNull()
      .references(() => characters.id),
    itemId: integer("item_id")
      .notNull()
      .references(() => items.id),
    quantity: integer("quantity").notNull().default(1),
    source: text("source").notNull().default("manual"),
  },
  (table) => [primaryKey({ columns: [table.characterId, table.itemId, table.source] })],
);

export const characterSpells = sqliteTable(
  "character_spells",
  {
    characterId: integer("character_id")
      .notNull()
      .references(() => characters.id),
    spellId: integer("spell_id")
      .notNull()
      .references(() => spells.id),
    prepared: integer("prepared", { mode: "boolean" }).notNull().default(false),
  },
  (table) => [primaryKey({ columns: [table.characterId, table.spellId] })],
);

export const relations = defineRelations(
  {
    backgrounds,
    backgroundDetails,
    characterBackgroundChoices,
    characterClassChoices,
    characterClassSelections,
    characterSubclasses,
    classChoiceGroups,
    classChoiceOptions,
    classFeatures,
    classLevels,
    subclasses,
    characterFeats,
    characterSkillProficiencies,
    characterToolProficiencies,
    characterSpeciesChoices,
    characterItems,
    characterSpells,
    characters,
    classes,
    features,
    items,
    species,
    speciesChoiceGroups,
    speciesChoiceOptions,
    speciesChoiceOptionToFeatures,
    speciesToFeatures,
    spells,
  },
  (r) => ({
    backgrounds: {
      details: r.one.backgroundDetails({
        from: r.backgrounds.id,
        to: r.backgroundDetails.backgroundId,
      }),
    },
    backgroundDetails: {
      background: r.one.backgrounds({
        from: r.backgroundDetails.backgroundId,
        to: r.backgrounds.id,
      }),
    },
    classes: {
      levels: r.many.classLevels({ from: r.classes.id, to: r.classLevels.classId }),
      features: r.many.classFeatures({ from: r.classes.id, to: r.classFeatures.classId }),
      subclasses: r.many.subclasses({ from: r.classes.id, to: r.subclasses.classId }),
      choiceGroups: r.many.classChoiceGroups({
        from: r.classes.id,
        to: r.classChoiceGroups.classId,
      }),
    },
    classLevels: {
      class: r.one.classes({ from: r.classLevels.classId, to: r.classes.id }),
    },
    classFeatures: {
      class: r.one.classes({ from: r.classFeatures.classId, to: r.classes.id }),
      subclass: r.one.subclasses({ from: r.classFeatures.subclassId, to: r.subclasses.id }),
    },
    subclasses: {
      class: r.one.classes({ from: r.subclasses.classId, to: r.classes.id }),
      features: r.many.classFeatures({ from: r.subclasses.id, to: r.classFeatures.subclassId }),
    },
    classChoiceGroups: {
      class: r.one.classes({ from: r.classChoiceGroups.classId, to: r.classes.id }),
      options: r.many.classChoiceOptions({
        from: r.classChoiceGroups.id,
        to: r.classChoiceOptions.choiceGroupId,
      }),
    },
    classChoiceOptions: {
      choiceGroup: r.one.classChoiceGroups({
        from: r.classChoiceOptions.choiceGroupId,
        to: r.classChoiceGroups.id,
      }),
    },
    characters: {
      background: r.one.backgrounds({
        from: r.characters.backgroundId,
        to: r.backgrounds.id,
      }),
      class: r.one.classes({
        from: r.characters.classId,
        to: r.classes.id,
      }),
      inventory: r.many.characterItems({
        from: r.characters.id,
        to: r.characterItems.characterId,
      }),
      species: r.one.species({
        from: r.characters.speciesId,
        to: r.species.id,
      }),
      spells: r.many.characterSpells({
        from: r.characters.id,
        to: r.characterSpells.characterId,
      }),
      speciesChoices: r.many.characterSpeciesChoices({
        from: r.characters.id,
        to: r.characterSpeciesChoices.characterId,
      }),
    },
    characterSpeciesChoices: {
      choiceGroup: r.one.speciesChoiceGroups({
        from: r.characterSpeciesChoices.choiceGroupId,
        to: r.speciesChoiceGroups.id,
      }),
      choiceOption: r.one.speciesChoiceOptions({
        from: r.characterSpeciesChoices.choiceOptionId,
        to: r.speciesChoiceOptions.id,
      }),
      character: r.one.characters({
        from: r.characterSpeciesChoices.characterId,
        to: r.characters.id,
      }),
    },
    characterItems: {
      character: r.one.characters({
        optional: false,
        from: r.characterItems.characterId,
        to: r.characters.id,
      }),
      item: r.one.items({
        optional: false,
        from: r.characterItems.itemId,
        to: r.items.id,
      }),
    },
    characterSpells: {
      character: r.one.characters({
        optional: false,
        from: r.characterSpells.characterId,
        to: r.characters.id,
      }),
      spell: r.one.spells({
        optional: false,
        from: r.characterSpells.spellId,
        to: r.spells.id,
      }),
    },
    species: {
      traits: r.many.features({
        from: r.species.id.through(r.speciesToFeatures.specieId),
        to: r.features.id.through(r.speciesToFeatures.featureId),
      }),
      choiceGroups: r.many.speciesChoiceGroups({
        from: r.species.id,
        to: r.speciesChoiceGroups.speciesId,
      }),
    },
    speciesChoiceGroups: {
      species: r.one.species({
        from: r.speciesChoiceGroups.speciesId,
        to: r.species.id,
      }),
      options: r.many.speciesChoiceOptions({
        from: r.speciesChoiceGroups.id,
        to: r.speciesChoiceOptions.choiceGroupId,
      }),
    },
    speciesChoiceOptions: {
      choiceGroup: r.one.speciesChoiceGroups({
        from: r.speciesChoiceOptions.choiceGroupId,
        to: r.speciesChoiceGroups.id,
      }),
      features: r.many.features({
        from: r.speciesChoiceOptions.id.through(r.speciesChoiceOptionToFeatures.choiceOptionId),
        to: r.features.id.through(r.speciesChoiceOptionToFeatures.featureId),
      }),
    },
  }),
);
