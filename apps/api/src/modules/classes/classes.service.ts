import { asc, eq, inArray } from "drizzle-orm";
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

export class ClassesService {
  private readonly db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  list() {
    return this.db.select().from(classes).orderBy(classes.name).all();
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
