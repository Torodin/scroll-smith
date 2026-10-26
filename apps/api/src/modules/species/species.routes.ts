import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { idParamSchema } from "../../shared/params.schema.ts";
import type { SpeciesService } from "./species.service.ts";

export function createSpeciesRoutes(service: SpeciesService) {
  return new Hono()
    .get("/", (c) => c.json(service.list()))
    .get("/:id", zValidator("param", idParamSchema), (c) =>
      c.json(service.get(c.req.valid("param").id)),
    );
}
