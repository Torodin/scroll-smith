import { z } from "zod";

const text = z.string().trim().min(1);

const shape = {
  name: z.string().trim().min(1).max(100),
  description: text,
  level: z.number().int().min(0).max(9),
  school: text,
  castingTime: z.string().trim(),
  range: z.string().trim(),
  components: z.array(z.enum(["V", "S", "M"])),
  material: z.string().trim().nullable(),
  duration: z.string().trim(),
  concentration: z.boolean(),
  ritual: z.boolean(),
  higherLevel: z.string().trim().nullable(),
  classIds: z.array(z.number().int().positive()),
};

export const createSpellSchema = z.object({
  name: shape.name,
  description: shape.description,
  level: shape.level,
  school: shape.school,
  castingTime: shape.castingTime.optional(),
  range: shape.range.optional(),
  components: shape.components.optional(),
  material: shape.material.optional(),
  duration: shape.duration.optional(),
  concentration: shape.concentration.optional(),
  ritual: shape.ritual.optional(),
  higherLevel: shape.higherLevel.optional(),
  classIds: shape.classIds.default([]),
});

export const updateSpellSchema = z
  .object({
    name: shape.name.optional(),
    description: shape.description.optional(),
    level: shape.level.optional(),
    school: shape.school.optional(),
    castingTime: shape.castingTime.optional(),
    range: shape.range.optional(),
    components: shape.components.optional(),
    material: shape.material.optional(),
    duration: shape.duration.optional(),
    concentration: shape.concentration.optional(),
    ritual: shape.ritual.optional(),
    higherLevel: shape.higherLevel.optional(),
    classIds: shape.classIds.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Body must not be empty",
  });

export type CreateSpell = z.infer<typeof createSpellSchema>;
export type UpdateSpell = z.infer<typeof updateSpellSchema>;
