import { z } from "zod";

const text = z.string().trim().min(1);
const abilityScore = z.enum([
  "Strength",
  "Dexterity",
  "Constitution",
  "Intelligence",
  "Wisdom",
  "Charisma",
]);
const level = z.number().int().min(1).max(20);

const levelSchema = z.object({
  level,
  proficiencyBonus: z.number().int().positive(),
  columns: z.record(z.string(), z.union([z.string(), z.number()])),
  spellSlots: z.array(z.number().int().nonnegative()).nullable().optional(),
});

const featureSchema = z.object({
  level,
  name: text,
  description: text,
});

const subclassSchema = z.object({
  name: text,
  description: text,
  features: z.array(featureSchema).default([]),
});

const choiceOptionSchema = z.object({
  name: text,
  description: text,
  extraCantrips: z.number().int().nonnegative().default(0),
});

const choiceGroupSchema = z.object({
  level: level.default(1),
  name: text,
  description: text,
  choiceCount: z.number().int().positive().default(1),
  options: z.array(choiceOptionSchema).default([]),
});

const equipmentPackage = z.object({
  items: z.array(z.object({ item: text, quantity: z.number().int().positive() })),
  gold: z.number().int().nonnegative(),
});

const baseShape = {
  name: z.string().trim().min(1).max(100),
  description: text,
  hitPointDie: z.number().int().positive(),
  primaryAbility: z.string().trim(),
  savingThrows: z.array(abilityScore),
  armorTraining: z.array(text),
  weaponProficiencies: z.array(text),
  toolProficiencies: z.array(text),
  toolChoice: z.object({ count: z.number().int().positive(), category: text }).nullable(),
  skillChoiceCount: z.number().int().nonnegative(),
  skillChoiceOptions: z.array(text),
  expertiseCount: z.number().int().nonnegative(),
  weaponMasteryCount: z.number().int().nonnegative(),
  spellbookCount: z.number().int().nonnegative(),
  spellcastingAbility: abilityScore.nullable(),
  startingEquipment: z.object({
    packages: z.record(z.string(), equipmentPackage),
    goldAlternative: z.number().int().nonnegative(),
  }),
};

const nestedShape = {
  levels: z.array(levelSchema).refine((l) => new Set(l.map((x) => x.level)).size === l.length, {
    message: "Levels must be unique",
  }),
  features: z.array(featureSchema),
  subclasses: z.array(subclassSchema),
  choiceGroups: z.array(choiceGroupSchema),
};

export const createClassSchema = z.object({
  name: baseShape.name,
  description: baseShape.description,
  hitPointDie: baseShape.hitPointDie,
  primaryAbility: baseShape.primaryAbility.optional(),
  savingThrows: baseShape.savingThrows.optional(),
  armorTraining: baseShape.armorTraining.optional(),
  weaponProficiencies: baseShape.weaponProficiencies.optional(),
  toolProficiencies: baseShape.toolProficiencies.optional(),
  toolChoice: baseShape.toolChoice.optional(),
  skillChoiceCount: baseShape.skillChoiceCount.optional(),
  skillChoiceOptions: baseShape.skillChoiceOptions.optional(),
  expertiseCount: baseShape.expertiseCount.optional(),
  weaponMasteryCount: baseShape.weaponMasteryCount.optional(),
  spellbookCount: baseShape.spellbookCount.optional(),
  spellcastingAbility: baseShape.spellcastingAbility.optional(),
  startingEquipment: baseShape.startingEquipment.optional(),
  levels: nestedShape.levels.default([]),
  features: nestedShape.features.default([]),
  subclasses: nestedShape.subclasses.default([]),
  choiceGroups: nestedShape.choiceGroups.default([]),
});

export const updateClassSchema = z
  .object({
    name: baseShape.name.optional(),
    description: baseShape.description.optional(),
    hitPointDie: baseShape.hitPointDie.optional(),
    primaryAbility: baseShape.primaryAbility.optional(),
    savingThrows: baseShape.savingThrows.optional(),
    armorTraining: baseShape.armorTraining.optional(),
    weaponProficiencies: baseShape.weaponProficiencies.optional(),
    toolProficiencies: baseShape.toolProficiencies.optional(),
    toolChoice: baseShape.toolChoice.optional(),
    skillChoiceCount: baseShape.skillChoiceCount.optional(),
    skillChoiceOptions: baseShape.skillChoiceOptions.optional(),
    expertiseCount: baseShape.expertiseCount.optional(),
    weaponMasteryCount: baseShape.weaponMasteryCount.optional(),
    spellbookCount: baseShape.spellbookCount.optional(),
    spellcastingAbility: baseShape.spellcastingAbility.optional(),
    startingEquipment: baseShape.startingEquipment.optional(),
    levels: nestedShape.levels.optional(),
    features: nestedShape.features.optional(),
    subclasses: nestedShape.subclasses.optional(),
    choiceGroups: nestedShape.choiceGroups.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Body must not be empty",
  });

export type CreateClass = z.infer<typeof createClassSchema>;
export type UpdateClass = z.infer<typeof updateClassSchema>;
