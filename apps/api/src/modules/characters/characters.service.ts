import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import type { Db } from "../../db/client.ts";
import { characterItems, characters, characterSpells } from "../../db/schema.ts";
import type { CreateCharacter, UpdateCharacter } from "./characters.schema.ts";

function isForeignKeyError(err: unknown): boolean {
  const e = err as { code?: string; cause?: { code?: string } };
  return (e?.code ?? e?.cause?.code) === "SQLITE_CONSTRAINT_FOREIGNKEY";
}

export class CharactersService {
  private readonly db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  list() {
    return this.db.select().from(characters).orderBy(characters.id).all();
  }

  get(id: number) {
    const row = this.db.select().from(characters).where(eq(characters.id, id)).get();
    if (!row) throw new HTTPException(404, { message: "Character not found" });
    return row;
  }

  create(input: CreateCharacter) {
    try {
      return this.db.insert(characters).values(input).returning().get();
    } catch (err) {
      throw this.mapError(err);
    }
  }

  update(id: number, input: UpdateCharacter) {
    try {
      const row = this.db
        .update(characters)
        .set(input)
        .where(eq(characters.id, id))
        .returning()
        .get();
      if (!row) throw new HTTPException(404, { message: "Character not found" });
      return row;
    } catch (err) {
      throw this.mapError(err);
    }
  }

  remove(id: number) {
    this.db.transaction((tx) => {
      tx.delete(characterItems).where(eq(characterItems.characterId, id)).run();
      tx.delete(characterSpells).where(eq(characterSpells.characterId, id)).run();
      const deleted = tx.delete(characters).where(eq(characters.id, id)).returning().all();
      if (deleted.length === 0) throw new HTTPException(404, { message: "Character not found" });
    });
  }

  private mapError(err: unknown) {
    if (err instanceof HTTPException) return err;
    if (isForeignKeyError(err)) {
      return new HTTPException(400, { message: "Unknown species, background or class" });
    }
    return err;
  }
}
