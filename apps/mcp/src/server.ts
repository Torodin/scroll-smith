import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import {
  createBackgroundSchema,
  updateBackgroundSchema,
} from "../../api/src/modules/backgrounds/backgrounds.schema.ts";
import {
  createCharacterSchema,
  updateCharacterSchema,
} from "../../api/src/modules/characters/characters.schema.ts";
import {
  createClassSchema,
  updateClassSchema,
} from "../../api/src/modules/classes/classes.schema.ts";
import {
  createSpeciesSchema,
  updateSpeciesSchema,
} from "../../api/src/modules/species/species.schema.ts";
import {
  createSpellSchema,
  updateSpellSchema,
} from "../../api/src/modules/spells/spells.schema.ts";
import type { ApiClient } from "./api-client.ts";
import { ApiError } from "./api-client.ts";

type Shape = z.ZodRawShape;

type Resource = {
  singular: string;
  plural: string;
  path: string;
  description: string;
  create: z.ZodObject<Shape>;
  update: z.ZodObject<Shape>;
  listQuery?: Shape;
};

const idShape = { id: z.number().int().positive().describe("Resource id") };

export const resources: Resource[] = [
  {
    singular: "character",
    plural: "characters",
    path: "/characters",
    description: "D&D 5.5e player characters",
    create: createCharacterSchema,
    update: updateCharacterSchema,
  },
  {
    singular: "species",
    plural: "species",
    path: "/species",
    description: "playable species (races) with their traits",
    create: createSpeciesSchema,
    update: updateSpeciesSchema,
  },
  {
    singular: "background",
    plural: "backgrounds",
    path: "/backgrounds",
    description: "character backgrounds",
    create: createBackgroundSchema,
    update: updateBackgroundSchema,
  },
  {
    singular: "class",
    plural: "classes",
    path: "/classes",
    description: "character classes with their properties",
    create: createClassSchema,
    update: updateClassSchema,
  },
  {
    singular: "spell",
    plural: "spells",
    path: "/spells",
    description: "spells",
    create: createSpellSchema,
    update: updateSpellSchema,
    listQuery: {
      classId: z.number().int().positive().optional().describe("Only spells on this class's list"),
      maxLevel: z.number().int().min(0).max(9).optional().describe("Only spells up to this level"),
    },
  },
];

function ok(data: unknown): CallToolResult {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

async function run(fn: () => Promise<unknown>): Promise<CallToolResult> {
  try {
    return ok(await fn());
  } catch (err) {
    const message =
      err instanceof ApiError
        ? `API error ${err.status}: ${err.message}`
        : `Request failed: ${err instanceof Error ? err.message : String(err)}`;
    return { isError: true, content: [{ type: "text", text: message }] };
  }
}

function registerCrud(server: McpServer, api: ApiClient, r: Resource) {
  server.registerTool(
    `list_${r.plural}`,
    {
      title: `List ${r.plural}`,
      description: `List all ${r.description}.`,
      inputSchema: r.listQuery ?? {},
      annotations: { readOnlyHint: true },
    },
    (args) => run(() => api.request("GET", r.path, { query: args as Record<string, unknown> })),
  );

  server.registerTool(
    `get_${r.singular}`,
    {
      title: `Get ${r.singular}`,
      description: `Get one ${r.singular} by id.`,
      inputSchema: idShape,
      annotations: { readOnlyHint: true },
    },
    ({ id }) => run(() => api.request("GET", `${r.path}/${id}`)),
  );

  server.registerTool(
    `create_${r.singular}`,
    {
      title: `Create ${r.singular}`,
      description: `Create a ${r.singular}. Returns the created resource.`,
      inputSchema: r.create.shape,
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    (args) => run(() => api.request("POST", r.path, { body: args })),
  );

  server.registerTool(
    `update_${r.singular}`,
    {
      title: `Update ${r.singular}`,
      description: `Partially update a ${r.singular} by id; send only the fields to change.`,
      inputSchema: { ...idShape, ...r.update.shape },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
    },
    ({ id, ...body }) => run(() => api.request("PATCH", `${r.path}/${id}`, { body })),
  );

  server.registerTool(
    `delete_${r.singular}`,
    {
      title: `Delete ${r.singular}`,
      description: `Permanently delete a ${r.singular} by id.`,
      inputSchema: idShape,
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
    },
    ({ id }) =>
      run(async () => {
        await api.request("DELETE", `${r.path}/${id}`);
        return { deleted: true, id };
      }),
  );
}

export function createMcpServer(api: ApiClient) {
  const server = new McpServer({ name: "scroll-smith", version: "0.0.0" });
  for (const resource of resources) registerCrud(server, api, resource);
  return server;
}
