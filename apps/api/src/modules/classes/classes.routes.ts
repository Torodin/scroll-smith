import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { idParamSchema } from "../../shared/params.schema.ts";
import type { ClassesService } from "./classes.service.ts";

export function createClassesRoutes(service: ClassesService) {
  return new Hono()
    .get("/", (c) => c.json(service.list()))
    .get("/:id", zValidator("param", idParamSchema), (c) =>
      c.json(service.get(c.req.valid("param").id)),
    );
}
