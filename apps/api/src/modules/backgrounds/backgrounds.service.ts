import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import type { Db } from "../../db/client.ts";
import { backgroundDetails, backgrounds } from "../../db/schema.ts";

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
