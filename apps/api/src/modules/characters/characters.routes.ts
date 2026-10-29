import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { idParamSchema } from "../../shared/params.schema.ts";
import {
  createCharacterSchema,
  levelUpSchema,
  updateCharacterSchema,
} from "./characters.schema.ts";
import type { CharactersService } from "./characters.service.ts";

export function createCharactersRoutes(service: CharactersService) {
  return new Hono()
    .get("/", (c) => c.json(service.list()))
    .get("/:id", zValidator("param", idParamSchema), (c) =>
      c.json(service.get(c.req.valid("param").id)),
    )
    .post("/", zValidator("json", createCharacterSchema), (c) =>
      c.json(service.create(c.req.valid("json")), 201),
    )
    .post(
      "/:id/level-up",
      zValidator("param", idParamSchema),
      zValidator("json", levelUpSchema),
      (c) => c.json(service.levelUp(c.req.valid("param").id, c.req.valid("json"))),
    )
    .patch(
      "/:id",
      zValidator("param", idParamSchema),
      zValidator("json", updateCharacterSchema),
      (c) => c.json(service.update(c.req.valid("param").id, c.req.valid("json"))),
    )
    .delete("/:id", zValidator("param", idParamSchema), (c) => {
      service.remove(c.req.valid("param").id);
      return c.body(null, 204);
    });
}
