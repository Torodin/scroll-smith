import { expect, test } from "vite-plus/test";
import { createDb } from "../src/db/client.ts";
import { characters } from "../src/db/schema.ts";

test("migrations apply and tables are usable", () => {
  const db = createDb(":memory:");
  db.insert(characters).values({ name: "Aria" }).run();
  const rows = db.select().from(characters).all();
  expect(rows).toHaveLength(1);
  expect(rows[0]?.name).toBe("Aria");
});

test("each in-memory db is isolated", () => {
  createDb(":memory:").insert(characters).values({ name: "A" }).run();
  expect(createDb(":memory:").select().from(characters).all()).toHaveLength(0);
});
