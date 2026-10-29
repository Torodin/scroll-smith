import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ApiClient } from "./api-client.ts";
import { createMcpServer } from "./server.ts";

const api = new ApiClient(process.env.API_URL ?? "http://localhost:3000");
await createMcpServer(api).connect(new StdioServerTransport());
