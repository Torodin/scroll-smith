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

export const classes = sqliteTable("classes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  hitPointDie: integer("hit_point_die").notNull(),
});

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
});

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
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

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
  },
  (table) => [primaryKey({ columns: [table.characterId, table.itemId] })],
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
