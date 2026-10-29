import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { idParamSchema } from "../../shared/params.schema.ts";
import { createSpellSchema, updateSpellSchema } from "./spells.schema.ts";
import type { SpellsService } from "./spells.service.ts";

const listQuerySchema = z.object({
  classId: z.coerce.number().int().positive().optional(),
  maxLevel: z.coerce.number().int().min(0).max(9).optional(),
});

export function createSpellsRoutes(service: SpellsService) {
  return new Hono()
    .get("/", zValidator("query", listQuerySchema), (c) =>
      c.json(service.list(c.req.valid("query"))),
    )
    .get("/:id", zValidator("param", idParamSchema), (c) =>
      c.json(service.get(c.req.valid("param").id)),
    )
    .post("/", zValidator("json", createSpellSchema), (c) =>
      c.json(service.create(c.req.valid("json")), 201),
    )
    .patch("/:id", zValidator("param", idParamSchema), zValidator("json", updateSpellSchema), (c) =>
      c.json(service.update(c.req.valid("param").id, c.req.valid("json"))),
    )
    .delete("/:id", zValidator("param", idParamSchema), (c) => {
      service.remove(c.req.valid("param").id);
      return c.body(null, 204);
    });
}
