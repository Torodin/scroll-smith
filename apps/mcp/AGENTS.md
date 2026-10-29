## MCP server (apps/mcp)

- Exposes the API to agents as MCP tools: `list_<plural>`, `get_<singular>`, `create_<singular>`, `update_<singular>`, `delete_<singular>` for characters, species, backgrounds, classes and spells.
- It talks to a **running API** over HTTP (`API_URL`, default `http://localhost:3000`); it never opens the DB.
- Tool input schemas reuse the API's zod schemas via relative imports of `apps/api/src/modules/*/*.schema.ts`. To add a resource, add an entry to `resources` in `src/server.ts`.
- Transports: stdio (`src/stdio.ts`, `pnpm --filter mcp dev`) and stateless Streamable HTTP at `/mcp` (`src/http.ts`, `MCP_PORT` default 3001).
- Tests use an in-memory MCP client and `createApp(createDb(":memory:")).request` as the injected fetch.
- Example VS Code config:

```json
{
  "servers": {
    "scroll-smith": {
      "type": "stdio",
      "command": "node",
      "args": ["--env-file-if-exists=.env", "apps/mcp/src/stdio.ts"],
      "env": { "API_URL": "http://localhost:3000" }
    }
  }
}
```
