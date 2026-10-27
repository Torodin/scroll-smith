import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import type { SpellsService } from "./spells.service.ts";

const listQuerySchema = z.object({
  classId: z.coerce.number().int().positive().optional(),
  maxLevel: z.coerce.number().int().min(0).max(9).optional(),
});

export function createSpellsRoutes(service: SpellsService) {
  return new Hono().get("/", zValidator("query", listQuerySchema), (c) =>
    c.json(service.list(c.req.valid("query"))),
  );
}
