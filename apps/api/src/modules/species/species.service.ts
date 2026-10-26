import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import type { Db } from "../../db/client.ts";
import { species } from "../../db/schema.ts";

export class SpeciesService {
  private readonly db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  list() {
    return this.db.select().from(species).orderBy(species.name).all();
  }

  get(id: number) {
    const row = this.db.select().from(species).where(eq(species.id, id)).get();
    if (!row) throw new HTTPException(404, { message: "Species not found" });
    return row;
  }
}
