import { expect, test } from "vite-plus/test";
import { createDb } from "../src/db/client.ts";
import {
  backgrounds,
  characterItems,
  characterSpells,
  characters,
  classes,
  features,
  items,
  spells,
  species,
  speciesToFeatures,
} from "../src/db/schema.ts";

test("migrations apply and character content relations are usable", async () => {
  const db = createDb(":memory:");
  const backgroundId = Number(
    db.insert(backgrounds).values({ name: "Acolyte", description: "A temple servant." }).run()
      .lastInsertRowid,
  );
  const classId = Number(
    db
      .insert(classes)
      .values({ name: "Cleric", description: "A divine spellcaster.", hitPointDie: 8 })
      .run().lastInsertRowid,
  );
  const speciesId = Number(db.insert(species).values({ name: "Human" }).run().lastInsertRowid);
  const featureId = Number(
    db.insert(features).values({ name: "Resourceful", description: "A human species trait." }).run()
      .lastInsertRowid,
  );
  db.insert(speciesToFeatures).values({ specieId: speciesId, featureId }).run();
  const itemId = Number(
    db
      .insert(items)
      .values({ name: "Mace", description: "A simple melee weapon.", category: "weapon" })
      .run().lastInsertRowid,
  );
  const spellId = Number(
    db
      .insert(spells)
      .values({
        name: "Guidance",
        description: "Grant a brief divine insight.",
        level: 0,
        school: "divination",
      })
      .run().lastInsertRowid,
  );
  const characterId = Number(
    db
      .insert(characters)
      .values({
        name: "Aria",
        backgroundId,
        classId,
        speciesId,
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10,
      })
      .run().lastInsertRowid,
  );
  db.insert(characterItems).values({ characterId, itemId }).run();
  db.insert(characterSpells).values({ characterId, spellId, prepared: true }).run();

  const character = await db.query.characters.findFirst({
    with: {
      background: true,
      class: true,
      inventory: { with: { item: true } },
      species: true,
      spells: { with: { spell: true } },
    },
  });

  expect(character?.name).toBe("Aria");
  expect(character?.background?.name).toBe("Acolyte");
  expect(character?.class?.name).toBe("Cleric");
  expect(character?.species?.name).toBe("Human");
  expect(character?.inventory[0]?.item.name).toBe("Mace");
  expect(character?.inventory[0]?.quantity).toBe(1);
  expect(character?.spells[0]?.spell.name).toBe("Guidance");
  expect(character?.spells[0]?.prepared).toBe(true);
  const speciesWithTraits = await db.query.species.findFirst({ with: { traits: true } });
  expect(speciesWithTraits?.traits[0]?.name).toBe("Resourceful");
});

test("each in-memory db is isolated", () => {
  const firstDb = createDb(":memory:");
  firstDb.insert(characters).values({ name: "A" }).run();
  expect(firstDb.select().from(characters).all()[0]?.str).toBe(10);
  expect(createDb(":memory:").select().from(characters).all()).toHaveLength(0);
});
