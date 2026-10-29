import { z } from "zod";

const text = z.string().trim().min(1);

const feature = z.object({
  name: text.max(100),
  description: text,
  actionCost: z.number().int().nonnegative().nullable().optional(),
  uses: z.number().int().nonnegative().nullable().optional(),
});

const choiceOption = z.object({
  name: text.max(100),
  description: text,
  features: z.array(feature).default([]),
});

const choiceGroup = z.object({
  name: text.max(100),
  description: text,
  choiceCount: z.number().int().positive().default(1),
  options: z.array(choiceOption).default([]),
});

export const createSpeciesSchema = z.object({
  name: text.max(100),
  traits: z.array(feature).default([]),
  choiceGroups: z.array(choiceGroup).default([]),
});

export const updateSpeciesSchema = z
  .object({
    name: text.max(100).optional(),
    traits: z.array(feature).optional(),
    choiceGroups: z.array(choiceGroup).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Body must not be empty",
  });

export type CreateSpecies = z.infer<typeof createSpeciesSchema>;
export type UpdateSpecies = z.infer<typeof updateSpeciesSchema>;
