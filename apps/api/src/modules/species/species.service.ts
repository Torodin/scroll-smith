import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import type { Db } from "../../db/client.ts";
import {
  features,
  species,
  speciesChoiceGroups,
  speciesChoiceOptionToFeatures,
  speciesChoiceOptions,
  speciesToFeatures,
} from "../../db/schema.ts";

type SpeciesRow = typeof species.$inferSelect;

export class SpeciesService {
  private readonly db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  list() {
    return this.db
      .select()
      .from(species)
      .orderBy(species.name)
      .all()
      .map((row) => this.withTraits(row));
  }

  get(id: number) {
    const row = this.db.select().from(species).where(eq(species.id, id)).get();
    if (!row) throw new HTTPException(404, { message: "Species not found" });
    return this.withTraits(row);
  }

  private withTraits(row: SpeciesRow) {
    const traits = this.db
      .select({
        id: features.id,
        name: features.name,
        description: features.description,
        actionCost: features.actionCost,
        uses: features.uses,
      })
      .from(speciesToFeatures)
      .innerJoin(features, eq(features.id, speciesToFeatures.featureId))
      .where(eq(speciesToFeatures.specieId, row.id))
      .orderBy(features.name)
      .all();

    const choiceGroups = this.db
      .select()
      .from(speciesChoiceGroups)
      .where(eq(speciesChoiceGroups.speciesId, row.id))
      .orderBy(speciesChoiceGroups.id)
      .all()
      .map((group) => ({
        ...group,
        options: this.db
          .select()
          .from(speciesChoiceOptions)
          .where(eq(speciesChoiceOptions.choiceGroupId, group.id))
          .orderBy(speciesChoiceOptions.name)
          .all()
          .map((option) => ({
            ...option,
            features: this.db
              .select({
                id: features.id,
                name: features.name,
                description: features.description,
                actionCost: features.actionCost,
                uses: features.uses,
              })
              .from(speciesChoiceOptionToFeatures)
              .innerJoin(features, eq(features.id, speciesChoiceOptionToFeatures.featureId))
              .where(
                and(
                  eq(speciesChoiceOptionToFeatures.choiceGroupId, option.choiceGroupId),
                  eq(speciesChoiceOptionToFeatures.choiceOptionId, option.id),
                ),
              )
              .orderBy(features.name)
              .all(),
          })),
      }));

    return { ...row, traits, choiceGroups };
  }
}
