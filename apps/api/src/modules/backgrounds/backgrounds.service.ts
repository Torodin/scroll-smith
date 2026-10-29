import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import type { Db } from "../../db/client.ts";
import { backgroundDetails, backgrounds } from "../../db/schema.ts";
import type { CreateBackground, UpdateBackground } from "./backgrounds.schema.ts";

export class BackgroundsService {
  private readonly db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  list() {
    return this.db
      .select({ background: backgrounds, details: backgroundDetails })
      .from(backgrounds)
      .leftJoin(backgroundDetails, eq(backgroundDetails.backgroundId, backgrounds.id))
      .orderBy(backgrounds.name)
      .all()
      .map((row) => this.withProperties(row));
  }

  get(id: number) {
    const row = this.db
      .select({ background: backgrounds, details: backgroundDetails })
      .from(backgrounds)
      .leftJoin(backgroundDetails, eq(backgroundDetails.backgroundId, backgrounds.id))
      .where(eq(backgrounds.id, id))
      .get();
    if (!row) throw new HTTPException(404, { message: "Background not found" });
    return this.withProperties(row);
  }

  create(input: CreateBackground) {
    const { properties, ...background } = input;
    const id = this.db.transaction((tx) => {
      const created = tx.insert(backgrounds).values(background).returning().get();
      if (!created) throw new Error("Background insert returned no row");
      if (properties) {
        tx.insert(backgroundDetails)
          .values({ backgroundId: created.id, ...properties })
          .run();
      }
      return created.id;
    });
    return this.get(id);
  }

  update(id: number, input: UpdateBackground) {
    this.db.transaction((tx) => {
      const current = tx.select().from(backgrounds).where(eq(backgrounds.id, id)).get();
      if (!current) throw new HTTPException(404, { message: "Background not found" });

      const { properties, ...background } = input;
      if (Object.keys(background).length > 0) {
        tx.update(backgrounds).set(background).where(eq(backgrounds.id, id)).run();
      }
      if (properties !== undefined) {
        tx.delete(backgroundDetails).where(eq(backgroundDetails.backgroundId, id)).run();
        if (properties !== null) {
          tx.insert(backgroundDetails)
            .values({ backgroundId: id, ...properties })
            .run();
        }
      }
    });
    return this.get(id);
  }

  remove(id: number) {
    try {
      this.db.transaction((tx) => {
        const current = tx.select().from(backgrounds).where(eq(backgrounds.id, id)).get();
        if (!current) throw new HTTPException(404, { message: "Background not found" });

        tx.delete(backgroundDetails).where(eq(backgroundDetails.backgroundId, id)).run();
        tx.delete(backgrounds).where(eq(backgrounds.id, id)).run();
      });
    } catch (err) {
      if (err instanceof HTTPException) throw err;
      const error = err as { code?: string; cause?: { code?: string } };
      if ((error.code ?? error.cause?.code) === "SQLITE_CONSTRAINT_FOREIGNKEY") {
        throw new HTTPException(409, { message: "Background is in use by characters" });
      }
      throw err;
    }
  }

  private withProperties(row: {
    background: typeof backgrounds.$inferSelect;
    details: typeof backgroundDetails.$inferSelect | null;
  }) {
    const { details, ...result } = row;
    return {
      ...result.background,
      properties: details
        ? {
            abilityScores: details.abilityScores,
            feat: details.feat,
            skillProficiencies: details.skillProficiencies,
            toolProficiency: details.toolProficiency,
            equipment: details.equipment,
          }
        : null,
    };
  }
}
