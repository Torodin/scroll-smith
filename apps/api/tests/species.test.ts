import { expect, test } from "vite-plus/test";
import { createApp } from "../src/app.ts";
import { createDb } from "../src/db/client.ts";
import {
  features,
  speciesChoiceGroups,
  speciesChoiceOptionToFeatures,
  speciesChoiceOptions,
  speciesToFeatures,
  species,
} from "../src/db/schema.ts";

test("species", async () => {
  const app = createApp(createDb(":memory:"));
  expect(await (await app.request("/species")).json()).toHaveLength(9);
  expect((await app.request("/species/1")).status).toBe(200);
  const elf = await (await app.request("/species/3")).json();
  expect(elf).toMatchObject({
    name: "Elf",
    traits: expect.arrayContaining([expect.objectContaining({ name: "Darkvision" })]),
    choiceGroups: [
      {
        name: "Elven Lineage",
        options: expect.arrayContaining([
          expect.objectContaining({ name: "Drow" }),
          expect.objectContaining({ name: "High Elf" }),
          expect.objectContaining({ name: "Wood Elf" }),
        ]),
      },
    ],
  });
  const speciesList = await (await app.request("/species")).json();
  expect(speciesList).toMatchObject(
    expect.arrayContaining([
      expect.objectContaining({
        name: "Dragonborn",
        choiceGroups: [
          expect.objectContaining({
            name: "Draconic Ancestry",
            options: expect.arrayContaining([expect.objectContaining({ name: "Black" })]),
          }),
        ],
      }),
      expect.objectContaining({
        name: "Goliath",
        traits: expect.arrayContaining([
          expect.objectContaining({ name: "Large Form" }),
          expect.objectContaining({ name: "Powerful Build" }),
        ]),
      }),
      expect.objectContaining({
        name: "Tiefling",
        choiceGroups: [
          expect.objectContaining({
            name: "Fiendish Legacy",
            options: expect.arrayContaining([expect.objectContaining({ name: "Infernal" })]),
          }),
        ],
      }),
    ]),
  );
  expect((await app.request("/species/999")).status).toBe(404);
  expect((await app.request("/species/abc")).status).toBe(400);
});

test("species responses include fixed traits and choice options with their granted features", async () => {
  const db = createDb(":memory:");
  const app = createApp(db);
  const testSpeciesId = Number(
    db.insert(species).values({ name: "Test Elf" }).run().lastInsertRowid,
  );
  const fixedFeatureId = Number(
    db
      .insert(features)
      .values({ name: "Fey Ancestry", description: "You have ancestry from the Feywild." })
      .run().lastInsertRowid,
  );
  db.insert(speciesToFeatures).values({ specieId: testSpeciesId, featureId: fixedFeatureId }).run();
  const featureId = Number(
    db
      .insert(features)
      .values({ name: "Drow Magic", description: "You know a lineage spell." })
      .run().lastInsertRowid,
  );
  const choiceGroupId = Number(
    db
      .insert(speciesChoiceGroups)
      .values({
        speciesId: testSpeciesId,
        name: "Elven Lineage",
        description: "Choose an elven lineage.",
      })
      .run().lastInsertRowid,
  );
  const optionId = Number(
    db
      .insert(speciesChoiceOptions)
      .values({
        choiceGroupId,
        name: "Drow",
        description: "A lineage associated with the Underdark.",
      })
      .run().lastInsertRowid,
  );
  db.insert(speciesChoiceOptionToFeatures)
    .values({ choiceGroupId, choiceOptionId: optionId, featureId })
    .run();

  const elfWithRelations = await db.query.species.findFirst({
    where: { id: testSpeciesId },
    with: { choiceGroups: { with: { options: { with: { features: true } } } } },
  });
  expect(elfWithRelations?.choiceGroups[0]?.options[0]?.features[0]?.name).toBe("Drow Magic");

  const elf = await (await app.request(`/species/${testSpeciesId}`)).json();
  expect(elf).toMatchObject({
    name: "Test Elf",
    traits: [{ name: "Fey Ancestry" }],
    choiceGroups: [
      {
        name: "Elven Lineage",
        choiceCount: 1,
        options: [{ name: "Drow", features: [{ name: "Drow Magic" }] }],
      },
    ],
  });
  const speciesList = await (await app.request("/species")).json();
  expect(speciesList).toMatchObject(
    expect.arrayContaining([
      expect.objectContaining({
        name: "Test Elf",
        choiceGroups: expect.arrayContaining([expect.objectContaining({ name: "Elven Lineage" })]),
      }),
    ]),
  );
});
