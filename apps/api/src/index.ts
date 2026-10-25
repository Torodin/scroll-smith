import { serve } from "@hono/node-server";
import { createApp } from "./app.ts";
import { createDb } from "./db/client.ts";

const port = Number(process.env.PORT) || 3000;
const app = createApp(createDb());

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`);
});
