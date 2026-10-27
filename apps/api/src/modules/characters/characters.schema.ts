import { z } from "zod";

const ability = z.number().int().min(1).max(30);
const refId = z.number().int().positive();
const speciesChoice = z.object({
  choiceGroupId: refId,
  choiceOptionId: refId,
});
const speciesChoices = z.array(speciesChoice);

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
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Body must not be empty" });

export type CreateCharacter = z.infer<typeof createCharacterSchema>;
export type UpdateCharacter = z.infer<typeof updateCharacterSchema>;
