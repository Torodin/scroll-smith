import { z } from "zod";

const abilityScore = z.enum([
  "Strength",
  "Dexterity",
  "Constitution",
  "Intelligence",
  "Wisdom",
  "Charisma",
]);

const properties = z.object({
  abilityScores: z.array(abilityScore),
  feat: z.string().trim().min(1),
  skillProficiencies: z.array(z.string().trim().min(1)),
  toolProficiency: z.discriminatedUnion("type", [
    z.object({ type: z.literal("specific"), name: z.string().trim().min(1) }),
    z.object({ type: z.literal("choice"), category: z.string().trim().min(1) }),
  ]),
  equipment: z.object({
    package: z.object({
      items: z.array(
        z.object({
          item: z.string().trim().min(1),
          quantity: z.number().int().positive(),
        }),
      ),
      gold: z.number().int().nonnegative(),
    }),
    alternative: z.object({
      amount: z.number().int().nonnegative(),
      currency: z.literal("GP"),
    }),
  }),
});

export const createBackgroundSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1),
  properties: properties.nullable().optional(),
});

export const updateBackgroundSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    description: z.string().trim().min(1).optional(),
    properties: properties.nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Body must not be empty",
  });

export type CreateBackground = z.infer<typeof createBackgroundSchema>;
export type UpdateBackground = z.infer<typeof updateBackgroundSchema>;
