import { and, eq, inArray } from "drizzle-orm";
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

import type { CreateSpecies, UpdateSpecies } from "./species.schema.ts";

type SpeciesRow = typeof species.$inferSelect;
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
type FeatureInput = CreateSpecies["traits"][number];

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

  create(input: CreateSpecies) {
    const id = this.db.transaction((tx) => {
      const created = tx.insert(species).values({ name: input.name }).returning().get();
      if (!created) throw new Error("Species insert returned no row");
      this.insertTraits(tx, created.id, input.traits);
      this.insertChoiceGroups(tx, created.id, input.choiceGroups);
      return created.id;
    });
    return this.get(id);
  }

  update(id: number, input: UpdateSpecies) {
    this.db.transaction((tx) => {
      const current = tx.select().from(species).where(eq(species.id, id)).get();
      if (!current) throw new HTTPException(404, { message: "Species not found" });

      if (input.name !== undefined) {
        tx.update(species).set({ name: input.name }).where(eq(species.id, id)).run();
      }
      if (input.traits !== undefined) {
        this.deleteTraits(tx, id);
        this.insertTraits(tx, id, input.traits);
      }
      if (input.choiceGroups !== undefined) {
        this.deleteChoiceGroups(tx, id);
        this.insertChoiceGroups(tx, id, input.choiceGroups);
      }
    });
    return this.get(id);
  }

  remove(id: number) {
    try {
      this.db.transaction((tx) => {
        const current = tx.select().from(species).where(eq(species.id, id)).get();
        if (!current) throw new HTTPException(404, { message: "Species not found" });

        this.deleteTraits(tx, id);
        this.deleteChoiceGroups(tx, id);
        tx.delete(species).where(eq(species.id, id)).run();
      });
    } catch (err) {
      if (err instanceof HTTPException) throw err;
      const error = err as { code?: string; cause?: { code?: string } };
      if ((error.code ?? error.cause?.code) === "SQLITE_CONSTRAINT_FOREIGNKEY") {
        throw new HTTPException(409, { message: "Species is in use by characters" });
      }
      throw err;
    }
  }

  private insertFeature(tx: Tx, feature: FeatureInput) {
    const created = tx
      .insert(features)
      .values({
        name: feature.name,
        description: feature.description,
        actionCost: feature.actionCost ?? null,
        uses: feature.uses ?? null,
      })
      .returning()
      .get();
    if (!created) throw new Error("Feature insert returned no row");
    return created.id;
  }

  private insertTraits(tx: Tx, speciesId: number, traits: FeatureInput[]) {
    for (const trait of traits) {
      const featureId = this.insertFeature(tx, trait);
      tx.insert(speciesToFeatures).values({ specieId: speciesId, featureId }).run();
    }
  }

  private insertChoiceGroups(tx: Tx, speciesId: number, groups: CreateSpecies["choiceGroups"]) {
    for (const { options, ...group } of groups) {
      const createdGroup = tx
        .insert(speciesChoiceGroups)
        .values({ speciesId, ...group })
        .returning()
        .get();
      if (!createdGroup) throw new Error("Choice group insert returned no row");
      for (const { features: optionFeatures, ...option } of options) {
        const createdOption = tx
          .insert(speciesChoiceOptions)
          .values({ choiceGroupId: createdGroup.id, ...option })
          .returning()
          .get();
        if (!createdOption) throw new Error("Choice option insert returned no row");
        for (const feature of optionFeatures) {
          const featureId = this.insertFeature(tx, feature);
          tx.insert(speciesChoiceOptionToFeatures)
            .values({
              choiceGroupId: createdGroup.id,
              choiceOptionId: createdOption.id,
              featureId,
            })
            .run();
        }
      }
    }
  }

  private deleteTraits(tx: Tx, speciesId: number) {
    const featureIds = tx
      .select({ id: speciesToFeatures.featureId })
      .from(speciesToFeatures)
      .where(eq(speciesToFeatures.specieId, speciesId))
      .all()
      .map((row) => row.id);
    tx.delete(speciesToFeatures).where(eq(speciesToFeatures.specieId, speciesId)).run();
    if (featureIds.length > 0) tx.delete(features).where(inArray(features.id, featureIds)).run();
  }

  private deleteChoiceGroups(tx: Tx, speciesId: number) {
    const groupIds = tx
      .select({ id: speciesChoiceGroups.id })
      .from(speciesChoiceGroups)
      .where(eq(speciesChoiceGroups.speciesId, speciesId))
      .all()
      .map((row) => row.id);
    if (groupIds.length === 0) return;

    const featureIds = tx
      .select({ id: speciesChoiceOptionToFeatures.featureId })
      .from(speciesChoiceOptionToFeatures)
      .where(inArray(speciesChoiceOptionToFeatures.choiceGroupId, groupIds))
      .all()
      .map((row) => row.id);
    tx.delete(speciesChoiceOptionToFeatures)
      .where(inArray(speciesChoiceOptionToFeatures.choiceGroupId, groupIds))
      .run();
    if (featureIds.length > 0) tx.delete(features).where(inArray(features.id, featureIds)).run();
    tx.delete(speciesChoiceOptions)
      .where(inArray(speciesChoiceOptions.choiceGroupId, groupIds))
      .run();
    tx.delete(speciesChoiceGroups).where(inArray(speciesChoiceGroups.id, groupIds)).run();
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
