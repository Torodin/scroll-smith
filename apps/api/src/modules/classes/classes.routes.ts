import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { idParamSchema } from "../../shared/params.schema.ts";
import { createClassSchema, updateClassSchema } from "./classes.schema.ts";
import type { ClassesService } from "./classes.service.ts";

export function createClassesRoutes(service: ClassesService) {
  return new Hono()
    .get("/", (c) => c.json(service.list()))
    .get("/:id", zValidator("param", idParamSchema), (c) =>
      c.json(service.get(c.req.valid("param").id)),
    )
    .post("/", zValidator("json", createClassSchema), (c) =>
      c.json(service.create(c.req.valid("json")), 201),
    )
    .patch("/:id", zValidator("param", idParamSchema), zValidator("json", updateClassSchema), (c) =>
      c.json(service.update(c.req.valid("param").id, c.req.valid("json"))),
    )
    .delete("/:id", zValidator("param", idParamSchema), (c) => {
      service.remove(c.req.valid("param").id);
      return c.body(null, 204);
    });
}
