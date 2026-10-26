import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { Db } from "./db/client.ts";
import { createCharactersRoutes } from "./modules/characters/characters.routes.ts";
import { CharactersService } from "./modules/characters/characters.service.ts";
import { healthRoutes } from "./modules/health/health.routes.ts";

export function createApp(db: Db) {
  return new Hono()
    .onError((err, c) => {
      if (err instanceof HTTPException) {
        return c.json({ error: err.message }, err.status);
      }
      console.error(err);
      return c.json({ error: "Internal Server Error" }, 500);
    })
    .get("/", (c) => c.text("scroll-smith api"))
    .route("/health", healthRoutes)
    .route("/characters", createCharactersRoutes(new CharactersService(db)));
}

export type AppType = ReturnType<typeof createApp>;
