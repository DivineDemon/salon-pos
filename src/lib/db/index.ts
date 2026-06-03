import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle, type NeonDatabase } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

function configureNeonWebSocket() {
  if (typeof globalThis.WebSocket !== "undefined") return;
  try {
    // Node < 22 has no global WebSocket; Pool needs one for transactions.
    neonConfig.webSocketConstructor = require("ws");
  } catch {
    throw new Error(
      "Neon Pool requires WebSocket support. Use Node.js 22+ or install the `ws` package.",
    );
  }
}

configureNeonWebSocket();

let _pool: Pool | undefined;
let _db: NeonDatabase<typeof schema> | undefined;

export function getDb() {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set");
    }
    _pool = new Pool({ connectionString: url });
    _db = drizzle(_pool, { schema });
  }
  return _db;
}
