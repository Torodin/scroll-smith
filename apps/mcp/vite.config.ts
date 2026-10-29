import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/stdio.ts", "src/http.ts"],
    platform: "node",
  },
});
