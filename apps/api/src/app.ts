import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { Db } from "./db/client.ts";
import { createBackgroundsRoutes } from "./modules/backgrounds/backgrounds.routes.ts";
import { BackgroundsService } from "./modules/backgrounds/backgrounds.service.ts";
import { createCharactersRoutes } from "./modules/characters/characters.routes.ts";
import { CharactersService } from "./modules/characters/characters.service.ts";
import { createClassesRoutes } from "./modules/classes/classes.routes.ts";
import { ClassesService } from "./modules/classes/classes.service.ts";
import { healthRoutes } from "./modules/health/health.routes.ts";
import { createSpellsRoutes } from "./modules/spells/spells.routes.ts";
import { SpellsService } from "./modules/spells/spells.service.ts";
import { createSpeciesRoutes } from "./modules/species/species.routes.ts";
import { SpeciesService } from "./modules/species/species.service.ts";

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
    .route("/characters", createCharactersRoutes(new CharactersService(db)))
    .route("/species", createSpeciesRoutes(new SpeciesService(db)))
    .route("/backgrounds", createBackgroundsRoutes(new BackgroundsService(db)))
    .route("/classes", createClassesRoutes(new ClassesService(db)))
    .route("/spells", createSpellsRoutes(new SpellsService(db)));
}

export type AppType = ReturnType<typeof createApp>;
