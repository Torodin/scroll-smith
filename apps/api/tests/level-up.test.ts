import { expect, test } from "vite-plus/test";
import { createApp } from "../src/app.ts";
import { createDb } from "../src/db/client.ts";

const json = (method: string, body: unknown) => ({
  method,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

const acolyteChoices = {
  abilityIncreases: { mode: "split", plusTwo: "Wisdom", plusOne: "Intelligence" },
  equipment: "package",
};

type Spell = { id: number; name: string; level: number };

async function classSpells(app: ReturnType<typeof createApp>, classId: number) {
  return (await (await app.request(`/spells?classId=${classId}`)).json()) as Spell[];
}

async function create(app: ReturnType<typeof createApp>, classId: number, classChoices: unknown) {
  const response = await app.request(
    "/characters",
    json("POST", {
      name: "Hero",
      speciesId: 7,
      backgroundId: 1,
      classId,
      backgroundChoices: acolyteChoices,
      classChoices,
    }),
  );
  expect(response.status).toBe(201);
  return (await response.json()) as { id: number };
}

test("level up a barbarian through subclass and ability score improvement", async () => {
  const app = createApp(createDb(":memory:"));
  const { id } = await create(app, 1, {
    skills: ["Nature", "Perception"],
    weaponMasteries: ["Greataxe", "Handaxe"],
    equipment: "A",
  });
  const levelUp = (body: unknown, characterId = id) =>
    app.request(`/characters/${characterId}/level-up`, json("POST", body));

  expect((await levelUp({}, 99)).status).toBe(404);
  expect((await levelUp({ abilityIncrease: { mode: "feat", feat: "Alert" } })).status).toBe(400);

  const second = await levelUp({});
  expect(second.status).toBe(200);
  expect(await second.json()).toMatchObject({ level: 2, subclassId: null });

  const detail = (await (await app.request("/classes/1")).json()) as {
    subclasses: { id: number }[];
    choiceGroups: { level: number }[];
  };
  expect(detail.choiceGroups.filter((group) => group.level === 3)).toHaveLength(0);

  // Level 3 needs a subclass
  expect((await levelUp({})).status).toBe(400);
  expect((await levelUp({ subclassId: 9999 })).status).toBe(400);
  const third = await levelUp({ subclassId: detail.subclasses[0]!.id });
  expect(third.status).toBe(200);
  expect(await third.json()).toMatchObject({ level: 3, subclassId: detail.subclasses[0]!.id });

  // Level 4: ability score improvement, capped at 20
  expect((await levelUp({ subclassId: detail.subclasses[0]!.id })).status).toBe(400);
  expect((await levelUp({})).status).toBe(400);
  expect(
    (await levelUp({ abilityIncrease: { mode: "spread", first: "Strength", second: "Strength" } }))
      .status,
  ).toBe(400);
  const fourth = await levelUp({
    abilityIncrease: { mode: "split", plusTwo: "Strength" },
    weaponMasteries: ["Longsword"],
  });
  expect(fourth.status).toBe(200);
  expect(await fourth.json()).toMatchObject({ level: 4, str: 12 });
});

test("level up rejects characters at level 20 and stores feats", async () => {
  const app = createApp(createDb(":memory:"));
  const { id } = await create(app, 1, {
    skills: ["Nature", "Perception"],
    weaponMasteries: ["Greataxe", "Handaxe"],
    equipment: "A",
  });
  await app.request(`/characters/${id}`, json("PATCH", { level: 3 }));
  const detail = (await (await app.request("/classes/1")).json()) as {
    subclasses: { id: number }[];
  };
  const withFeat = await app.request(
    `/characters/${id}/level-up`,
    json("POST", {
      subclassId: detail.subclasses[0]!.id,
      abilityIncrease: { mode: "feat", feat: "Alert" },
      weaponMasteries: ["Longsword"],
    }),
  );
  expect(withFeat.status).toBe(200);
  expect(await withFeat.json()).toMatchObject({
    level: 4,
    feats: expect.arrayContaining(["Alert"]),
  });

  await app.request(`/characters/${id}`, json("PATCH", { level: 20 }));
  const capped = await app.request(`/characters/${id}/level-up`, json("POST", {}));
  expect(capped.status).toBe(400);
});

test("level up a wizard learns spellbook and prepared spells", async () => {
  const app = createApp(createDb(":memory:"));
  const spells = await classSpells(app, 12);
  const named = (...names: string[]) => names.map((n) => spells.find((s) => s.name === n)!.id);
  const { id } = await create(app, 12, {
    skills: ["Arcana", "History"],
    cantrips: named("Light", "Mage Hand", "Fire Bolt"),
    spellbook: named("Shield", "Magic Missile", "Sleep", "Detect Magic", "Mage Armor", "Identify"),
    preparedSpells: named("Shield", "Magic Missile", "Sleep", "Detect Magic"),
    equipment: "A",
  });
  const levelUp = (body: unknown) => app.request(`/characters/${id}/level-up`, json("POST", body));

  const [fireball] = named("Fireball");
  const [charm, comprehend] = named("Charm Person", "Comprehend Languages");

  // Needs two new spellbook spells and one more prepared spell
  expect((await levelUp({})).status).toBe(400);
  // Fireball is level 3, beyond the level 2 slots
  expect((await levelUp({ spellbook: [fireball!, charm!], preparedSpells: [charm!] })).status).toBe(
    400,
  );
  // Already-known spells are rejected
  expect(
    (await levelUp({ spellbook: named("Shield", "Sleep"), preparedSpells: [charm!] })).status,
  ).toBe(400);

  const response = await levelUp({
    spellbook: [charm!, comprehend!],
    preparedSpells: [charm!],
  });
  expect(response.status).toBe(200);
  const body = (await response.json()) as {
    level: number;
    spells: { name: string; prepared: boolean }[];
  };
  expect(body.level).toBe(2);
  expect(body.spells).toHaveLength(11);
  expect(body.spells.filter((spell) => spell.prepared)).toHaveLength(8);
});
