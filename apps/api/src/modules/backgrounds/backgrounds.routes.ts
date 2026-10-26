import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { idParamSchema } from "../../shared/params.schema.ts";
import type { BackgroundsService } from "./backgrounds.service.ts";

export function createBackgroundsRoutes(service: BackgroundsService) {
  return new Hono()
    .get("/", (c) => c.json(service.list()))
    .get("/:id", zValidator("param", idParamSchema), (c) =>
      c.json(service.get(c.req.valid("param").id)),
    );
}
