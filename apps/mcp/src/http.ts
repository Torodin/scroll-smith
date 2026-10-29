import { createServer } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { ApiClient } from "./api-client.ts";
import { createMcpServer } from "./server.ts";

const api = new ApiClient(process.env.API_URL ?? "http://localhost:3000");
const port = Number(process.env.MCP_PORT) || 3001;

// Stateless: every request gets its own server and transport.
const httpServer = createServer(async (req, res) => {
  if (new URL(req.url ?? "/", "http://localhost").pathname !== "/mcp") {
    res.writeHead(404).end();
    return;
  }
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  const server = createMcpServer(api);
  res.on("close", () => {
    void transport.close();
    void server.close();
  });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.writeHead(500).end();
  }
});

httpServer.listen(port, () => {
  console.log(`MCP server listening on http://localhost:${port}/mcp`);
});
