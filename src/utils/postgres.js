import { Pool } from "pg";

// Global variable to store the connection pool
let globalPool;

function createPool() {
  return new Pool({
    host: process.env.PG_HOST_NAME,
    port: parseInt(process.env.PG_PORT_NUMBER || "5432"),
    user: process.env.PG_USER_NAME,
    database: process.env.PG_DB_NAME,
    password: process.env.PG_DB_PASSWORD,
    max: 20, // Maximum pool size
    idleTimeoutMillis: 30000, // Connection timeout
    connectionTimeoutMillis: 10000, // Time to connect before timing out
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,

    // Additional production optimizations
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    allowExitOnIdle: process.env.NODE_ENV !== "production", // Allow exit in dev mode
  });
}

function getPool() {
  // In development, check for existing global pool to prevent multiple instances
  if (process.env.NODE_ENV === "development") {
    if (!global._postgresPool) {
      global._postgresPool = createPool();

      // Handle development hot reload cleanup
      global._postgresPool.on("error", (err) => {
        console.error("Unexpected error on idle client", err);
      });

      global._postgresPool.on("connect", () => {
        console.log("Database connected (development mode)");
      });
    }
    return global._postgresPool;
  }

  // In production, use singleton pattern
  if (!globalPool) {
    globalPool = createPool();

    globalPool.on("error", (err) => {
      console.error("Unexpected error on idle client", err);
      process.exit(-1);
    });

    globalPool.on("connect", () => {
      console.log("Database connected (production mode)");
    });

    // Graceful shutdown handling
    process.on("SIGINT", async () => {
      console.log("Closing database pool...");
      await globalPool.end();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      console.log("Closing database pool...");
      await globalPool.end();
      process.exit(0);
    });
  }

  return globalPool;
}

const globalForPg = globalThis;

if (!globalForPg.pgPool) {
  globalForPg.pgPool = createPool();
}
const pool = globalForPg.pgPool;

if (process.env.NODE_ENV === "production") {
  globalForPg.pgPool = pool;
}

// Legacy connection function for backward compatibility
export async function dbConnect() {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    client.release();
    console.log("Connected to database...", result.rows[0].now);
    return true;
  } catch (err) {
    console.error("Error in database connection", err.stack);
    return false;
  }
}

// Additional utility functions
export function getPoolStatus() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
    environment: process.env.NODE_ENV,
  };
}

// Named export for compatibility
export { pool };

// Single default export - the pool instance
export default pool;
