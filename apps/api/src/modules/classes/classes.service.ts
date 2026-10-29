import { and, asc, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import type { Db } from "../../db/client.ts";
import {
  classChoiceGroups,
  classChoiceOptions,
  classes,
  classFeatures,
  classLevels,
  subclasses,
} from "../../db/schema.ts";
import type { CreateClass, UpdateClass } from "./classes.schema.ts";

type Tx = Db;

export class ClassesService {
  private readonly db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  list() {
    return this.db.select().from(classes).orderBy(classes.name).all();
  }

  create(input: CreateClass) {
    const id = this.runInTransaction((tx) => {
      const { levels, features, subclasses: subs, choiceGroups, ...base } = input;
      const created = tx
        .insert(classes)
        .values(base as typeof classes.$inferInsert)
        .returning()
        .get();
      if (!created) throw new Error("Class insert returned no row");
      this.insertNested(tx, created.id, { levels, features, subclasses: subs, choiceGroups });
      return created.id;
    });
    return this.get(id);
  }

  update(id: number, input: UpdateClass) {
    this.runInTransaction((tx) => {
      const current = tx.select().from(classes).where(eq(classes.id, id)).get();
      if (!current) throw new HTTPException(404, { message: "Class not found" });

      const { levels, features, subclasses: subs, choiceGroups, ...base } = input;
      if (Object.keys(base).length > 0) {
        tx.update(classes)
          .set(base as Partial<typeof classes.$inferInsert>)
          .where(eq(classes.id, id))
          .run();
      }
      if (levels !== undefined) {
        tx.delete(classLevels).where(eq(classLevels.classId, id)).run();
      }
      if (features !== undefined) {
        tx.delete(classFeatures)
          .where(and(eq(classFeatures.classId, id), isNull(classFeatures.subclassId)))
          .run();
      }
      if (subs !== undefined) {
        tx.delete(classFeatures)
          .where(and(eq(classFeatures.classId, id), isNotNull(classFeatures.subclassId)))
          .run();
        tx.delete(subclasses).where(eq(subclasses.classId, id)).run();
      }
      if (choiceGroups !== undefined) this.deleteChoiceGroups(tx, id);

      this.insertNested(tx, id, { levels, features, subclasses: subs, choiceGroups });
    });
    return this.get(id);
  }

  remove(id: number) {
    this.runInTransaction((tx) => {
      const current = tx.select().from(classes).where(eq(classes.id, id)).get();
      if (!current) throw new HTTPException(404, { message: "Class not found" });

      tx.delete(classLevels).where(eq(classLevels.classId, id)).run();
      tx.delete(classFeatures).where(eq(classFeatures.classId, id)).run();
      tx.delete(subclasses).where(eq(subclasses.classId, id)).run();
      this.deleteChoiceGroups(tx, id);
      tx.delete(classes).where(eq(classes.id, id)).run();
    });
  }

  private runInTransaction<T>(fn: (tx: Tx) => T): T {
    try {
      return this.db.transaction((tx) => fn(tx as unknown as Tx) as never) as T;
    } catch (err) {
      if (err instanceof HTTPException) throw err;
      const error = err as { code?: string; cause?: { code?: string } };
      if ((error.code ?? error.cause?.code) === "SQLITE_CONSTRAINT_FOREIGNKEY") {
        throw new HTTPException(409, {
          message: "Class is in use by characters or spells",
        });
      }
      throw err;
    }
  }

  private deleteChoiceGroups(tx: Tx, classId: number) {
    const groupIds = tx
      .select({ id: classChoiceGroups.id })
      .from(classChoiceGroups)
      .where(eq(classChoiceGroups.classId, classId))
      .all()
      .map((g) => g.id);
    if (groupIds.length > 0) {
      tx.delete(classChoiceOptions)
        .where(inArray(classChoiceOptions.choiceGroupId, groupIds))
        .run();
    }
    tx.delete(classChoiceGroups).where(eq(classChoiceGroups.classId, classId)).run();
  }

  private insertNested(
    tx: Tx,
    classId: number,
    nested: {
      levels?: CreateClass["levels"];
      features?: CreateClass["features"];
      subclasses?: CreateClass["subclasses"];
      choiceGroups?: CreateClass["choiceGroups"];
    },
  ) {
    for (const lvl of nested.levels ?? []) {
      tx.insert(classLevels)
        .values({ ...lvl, classId, spellSlots: lvl.spellSlots ?? null })
        .run();
    }
    for (const feature of nested.features ?? []) {
      tx.insert(classFeatures)
        .values({ ...feature, classId, subclassId: null })
        .run();
    }
    for (const sub of nested.subclasses ?? []) {
      const { features, ...subclass } = sub;
      const created = tx
        .insert(subclasses)
        .values({ ...subclass, classId })
        .returning()
        .get();
      if (!created) throw new Error("Subclass insert returned no row");
      for (const feature of features) {
        tx.insert(classFeatures)
          .values({ ...feature, classId, subclassId: created.id })
          .run();
      }
    }
    for (const group of nested.choiceGroups ?? []) {
      const { options, ...groupValues } = group;
      const created = tx
        .insert(classChoiceGroups)
        .values({ ...groupValues, classId })
        .returning()
        .get();
      if (!created) throw new Error("Choice group insert returned no row");
      for (const option of options) {
        tx.insert(classChoiceOptions)
          .values({ ...option, choiceGroupId: created.id })
          .run();
      }
    }
  }

  get(id: number) {
    const row = this.db.select().from(classes).where(eq(classes.id, id)).get();
    if (!row) throw new HTTPException(404, { message: "Class not found" });

    const levels = this.db
      .select()
      .from(classLevels)
      .where(eq(classLevels.classId, id))
      .orderBy(asc(classLevels.level))
      .all();
    const features = this.db
      .select()
      .from(classFeatures)
      .where(eq(classFeatures.classId, id))
      .orderBy(asc(classFeatures.level), asc(classFeatures.id))
      .all();
    const subclassRows = this.db.select().from(subclasses).where(eq(subclasses.classId, id)).all();
    const groups = this.db
      .select()
      .from(classChoiceGroups)
      .where(eq(classChoiceGroups.classId, id))
      .orderBy(asc(classChoiceGroups.id))
      .all();
    const options =
      groups.length === 0
        ? []
        : this.db
            .select()
            .from(classChoiceOptions)
            .where(
              inArray(
                classChoiceOptions.choiceGroupId,
                groups.map((group) => group.id),
              ),
            )
            .orderBy(asc(classChoiceOptions.id))
            .all();

    return {
      ...row,
      levels: levels.map(({ classId: _classId, ...level }) => level),
      features: features
        .filter((f) => f.subclassId === null)
        .map(({ subclassId: _subclassId, classId: _classId, ...feature }) => feature),
      subclasses: subclassRows.map(({ classId: _classId, ...subclass }) => ({
        ...subclass,
        features: features
          .filter((f) => f.subclassId === subclass.id)
          .map(({ subclassId: _subclassId, classId: _classId, ...feature }) => feature),
      })),
      choiceGroups: groups.map(({ classId: _classId, ...group }) => ({
        ...group,
        options: options
          .filter((option) => option.choiceGroupId === group.id)
          .map(({ choiceGroupId: _groupId, ...option }) => option),
      })),
    };
  }
}
