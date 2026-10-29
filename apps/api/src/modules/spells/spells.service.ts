import { and, asc, eq, inArray, lte } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import type { Db } from "../../db/client.ts";
import { classes, spellClasses, spells } from "../../db/schema.ts";
import type { CreateSpell, UpdateSpell } from "./spells.schema.ts";

export interface SpellFilter {
  classId?: number;
  maxLevel?: number;
}

export class SpellsService {
  private readonly db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  list(filter: SpellFilter = {}) {
    const conditions = [];
    if (filter.maxLevel !== undefined) conditions.push(lte(spells.level, filter.maxLevel));
    if (filter.classId !== undefined) {
      const allowed = this.db
        .select({ id: spellClasses.spellId })
        .from(spellClasses)
        .where(eq(spellClasses.classId, filter.classId))
        .all()
        .map((row) => row.id);
      conditions.push(inArray(spells.id, allowed));
    }
    const rows = this.db
      .select()
      .from(spells)
      .where(and(...conditions))
      .orderBy(asc(spells.level), asc(spells.name))
      .all();
    if (rows.length === 0) return [];

    const classRows = this.db
      .select({ spellId: spellClasses.spellId, name: classes.name })
      .from(spellClasses)
      .innerJoin(classes, eq(classes.id, spellClasses.classId))
      .orderBy(asc(classes.name))
      .all();
    return rows.map((row) => ({
      ...row,
      classes: classRows.filter((entry) => entry.spellId === row.id).map((entry) => entry.name),
    }));
  }

  get(id: number) {
    const row = this.db.select().from(spells).where(eq(spells.id, id)).get();
    if (!row) throw new HTTPException(404, { message: "Spell not found" });
    const classRows = this.db
      .select({ name: classes.name })
      .from(spellClasses)
      .innerJoin(classes, eq(classes.id, spellClasses.classId))
      .where(eq(spellClasses.spellId, id))
      .orderBy(asc(classes.name))
      .all();
    return { ...row, classes: classRows.map((entry) => entry.name) };
  }

  create(input: CreateSpell) {
    const { classIds, ...base } = input;
    const id = this.runInTransaction((tx) => {
      const created = tx
        .insert(spells)
        .values(base as typeof spells.$inferInsert)
        .returning()
        .get();
      if (!created) throw new Error("Spell insert returned no row");
      this.setClasses(tx, created.id, classIds);
      return created.id;
    });
    return this.get(id);
  }

  update(id: number, input: UpdateSpell) {
    const { classIds, ...base } = input;
    this.runInTransaction((tx) => {
      const current = tx.select().from(spells).where(eq(spells.id, id)).get();
      if (!current) throw new HTTPException(404, { message: "Spell not found" });
      if (Object.keys(base).length > 0) {
        tx.update(spells)
          .set(base as Partial<typeof spells.$inferInsert>)
          .where(eq(spells.id, id))
          .run();
      }
      if (classIds !== undefined) this.setClasses(tx, id, classIds);
    });
    return this.get(id);
  }

  remove(id: number) {
    this.runInTransaction((tx) => {
      const current = tx.select().from(spells).where(eq(spells.id, id)).get();
      if (!current) throw new HTTPException(404, { message: "Spell not found" });
      tx.delete(spellClasses).where(eq(spellClasses.spellId, id)).run();
      tx.delete(spells).where(eq(spells.id, id)).run();
    });
  }

  private setClasses(tx: Db, spellId: number, classIds: number[]) {
    tx.delete(spellClasses).where(eq(spellClasses.spellId, spellId)).run();
    for (const classId of new Set(classIds)) {
      tx.insert(spellClasses).values({ spellId, classId }).run();
    }
  }

  private runInTransaction<T>(fn: (tx: Db) => T): T {
    try {
      return this.db.transaction((tx) => fn(tx as unknown as Db) as never) as T;
    } catch (err) {
      if (err instanceof HTTPException) throw err;
      const error = err as { code?: string; cause?: { code?: string } };
      if ((error.code ?? error.cause?.code) === "SQLITE_CONSTRAINT_FOREIGNKEY") {
        throw new HTTPException(409, {
          message: "Unknown class or spell is in use by characters",
        });
      }
      throw err;
    }
  }
}
