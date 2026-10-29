import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { expect, test } from "vite-plus/test";
import { createApp } from "../../api/src/app.ts";
import { createDb } from "../../api/src/db/client.ts";
import { ApiClient } from "../src/api-client.ts";
import { createMcpServer, resources } from "../src/server.ts";

async function connect() {
  const app = createApp(createDb(":memory:"));
  const api = new ApiClient("http://api.test", (url, init) => app.request(url, init));
  const server = createMcpServer(api);
  const client = new Client({ name: "test", version: "0.0.0" });
  const [a, b] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(a), client.connect(b)]);
  const call = async (name: string, args: Record<string, unknown> = {}) => {
    const res = await client.callTool({ name, arguments: args });
    const text = (res.content as { text: string }[])[0]!.text;
    return { isError: Boolean(res.isError), text, json: res.isError ? null : JSON.parse(text) };
  };
  return { client, call };
}

test("exposes list/get/create/update/delete tools for every resource", async () => {
  const { client } = await connect();
  const names = (await client.listTools()).tools.map((t) => t.name);
  expect(names).toHaveLength(resources.length * 5);
  for (const r of resources) {
    for (const op of ["list", "get", "create", "update", "delete"]) {
      expect(names).toContain(`${op}_${op === "list" ? r.plural : r.singular}`);
    }
  }
});

test("full CRUD for spells through MCP", async () => {
  const { call } = await connect();
  const list = await call("list_spells", { maxLevel: 0, classId: 12 });
  expect(list.json.length).toBeGreaterThan(0);

  const created = await call("create_spell", {
    name: "Test Bolt",
    description: "Zap.",
    level: 1,
    school: "Evocation",
  });
  expect(created.isError).toBe(false);
  const id = created.json.id as number;

  expect((await call("get_spell", { id })).json.name).toBe("Test Bolt");
  expect((await call("update_spell", { id, level: 2 })).json.level).toBe(2);
  expect((await call("delete_spell", { id })).json).toEqual({ deleted: true, id });

  const missing = await call("get_spell", { id });
  expect(missing.isError).toBe(true);
  expect(missing.text).toContain("404");
});

test("lists and reads seeded reference data and reports API validation errors", async () => {
  const { call } = await connect();
  for (const plural of ["species", "backgrounds", "classes", "characters"]) {
    expect(Array.isArray((await call(`list_${plural}`)).json)).toBe(true);
  }
  const species = (await call("list_species")).json as { id: number }[];
  expect((await call("get_species", { id: species[0]!.id })).isError).toBe(false);

  const bad = await call("update_spell", { id: 1 });
  expect(bad.isError).toBe(true);
});
