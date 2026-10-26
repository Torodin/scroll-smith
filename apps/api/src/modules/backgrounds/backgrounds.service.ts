import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import type { Db } from "../../db/client.ts";
import { backgrounds } from "../../db/schema.ts";

export class BackgroundsService {
  private readonly db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  list() {
    return this.db.select().from(backgrounds).orderBy(backgrounds.name).all();
  }

  get(id: number) {
    const row = this.db.select().from(backgrounds).where(eq(backgrounds.id, id)).get();
    if (!row) throw new HTTPException(404, { message: "Background not found" });
    return row;
  }
}
