import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema.ts";

export type Db = BetterSQLite3Database<typeof schema>;

// Source lives in src/db, the bundle in dist/; both resolve to apps/api/drizzle
const here = dirname(fileURLToPath(import.meta.url));
const migrationsFolder = [resolve(here, "../../drizzle"), resolve(here, "../drizzle")].find((p) =>
  existsSync(p),
)!;

export function createDb(path = process.env.DB_FILE_NAME ?? "./data/scroll-smith.db"): Db {
  if (path !== ":memory:") {
    mkdirSync(dirname(resolve(path)), { recursive: true });
  }
  const sqlite = new Database(path);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder });
  return db;
}
