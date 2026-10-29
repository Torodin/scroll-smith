import { z } from "zod";

const ability = z.number().int().min(1).max(30);
const refId = z.number().int().positive();
const speciesChoice = z.object({
  choiceGroupId: refId,
  choiceOptionId: refId,
});
const speciesChoices = z.array(speciesChoice);

const abilityName = z.enum([
  "Strength",
  "Dexterity",
  "Constitution",
  "Intelligence",
  "Wisdom",
  "Charisma",
]);
const backgroundChoices = z.object({
  abilityIncreases: z.discriminatedUnion("mode", [
    z.object({ mode: z.literal("split"), plusTwo: abilityName, plusOne: abilityName }),
    z.object({ mode: z.literal("even") }),
  ]),
  equipment: z.enum(["package", "gold"]),
  toolChoice: z.string().trim().min(1).optional(),
});

const names = z.array(z.string().trim().min(1));
const classChoices = z.object({
  skills: names,
  equipment: z.string().trim().min(1),
  tools: names.optional(),
  expertise: names.optional(),
  weaponMasteries: names.optional(),
  cantrips: z.array(refId).optional(),
  spellbook: z.array(refId).optional(),
  preparedSpells: z.array(refId).optional(),
  featureChoices: speciesChoices.optional(),
});

export const createCharacterSchema = z.object({
  name: z.string().trim().min(1).max(100),
  level: z.number().int().min(1).max(20).default(1),
  speciesId: refId,
  backgroundId: refId,
  classId: refId,
  str: ability.default(10),
  dex: ability.default(10),
  con: ability.default(10),
  int: ability.default(10),
  wis: ability.default(10),
  cha: ability.default(10),
  speciesChoices: speciesChoices.optional(),
  backgroundChoices: backgroundChoices.optional(),
  classChoices: classChoices.optional(),
});

// Built explicitly: partial() on a schema with defaults would overwrite fields on PATCH
export const updateCharacterSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    level: z.number().int().min(1).max(20).optional(),
    speciesId: refId.optional(),
    backgroundId: refId.optional(),
    classId: refId.optional(),
    str: ability.optional(),
    dex: ability.optional(),
    con: ability.optional(),
    int: ability.optional(),
    wis: ability.optional(),
    cha: ability.optional(),
    speciesChoices: speciesChoices.optional(),
    backgroundChoices: backgroundChoices.optional(),
    classChoices: classChoices.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Body must not be empty" });

export const levelUpSchema = z.object({
  subclassId: refId.optional(),
  abilityIncrease: z
    .discriminatedUnion("mode", [
      z.object({ mode: z.literal("split"), plusTwo: abilityName }),
      z.object({ mode: z.literal("spread"), first: abilityName, second: abilityName }),
      z.object({ mode: z.literal("feat"), feat: z.string().trim().min(1).max(100) }),
    ])
    .optional(),
  expertise: names.optional(),
  weaponMasteries: names.optional(),
  cantrips: z.array(refId).optional(),
  spellbook: z.array(refId).optional(),
  preparedSpells: z.array(refId).optional(),
  featureChoices: speciesChoices.optional(),
});

export type CreateCharacter = z.infer<typeof createCharacterSchema>;
export type LevelUp = z.infer<typeof levelUpSchema>;
export type UpdateCharacter = z.infer<typeof updateCharacterSchema>;
export type BackgroundChoices = z.infer<typeof backgroundChoices>;
export type ClassChoices = z.infer<typeof classChoices>;
