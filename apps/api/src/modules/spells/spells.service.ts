import { and, asc, eq, inArray, lte } from "drizzle-orm";
import type { Db } from "../../db/client.ts";
import { classes, spellClasses, spells } from "../../db/schema.ts";

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
}
