import pool from "@/utils/postgres";
import { Logger } from "@/lib/logger";

interface QueryOptions {
  params?: any[];
  singleRow?: boolean;
  transactionClient?: any;
  bypassCache?: boolean; // New option for real-time queries
}

export class DatabaseService {
  /**
   * Get connection pool status
   */
  static getPoolStatus() {
    return {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
      environment: process.env.NODE_ENV,
    };
  }

  /**
   * Test database connectivity
   */
  static async testConnection(): Promise<boolean> {
    try {
      const client = await pool.connect();
      await client.query("SELECT 1");
      client.release();
      return true;
    } catch (error) {
      Logger.error("Database connection test failed", { error });
      return false;
    }
  }

  /**
   * Execute a database query with connection monitoring
   */
  static async query<T>(sql: string, options: QueryOptions = {}): Promise<T> {
    const startTime = Date.now();
    const {
      params = [],
      singleRow = false,
      transactionClient,
      bypassCache = false,
    } = options;

    // Log connection pool status in development
    if (process.env.NODE_ENV === "development") {
      Logger.debug("Pool status before query", this.getPoolStatus());
    }

    const client = transactionClient || (await pool.connect());

    try {
      if (!transactionClient) {
        await client.query("BEGIN");
      }

      // Add cache control for real-time queries
      if (bypassCache && !transactionClient) {
        await client.query("SET SESSION statement_timeout = 0");
        await client.query("SET SESSION lock_timeout = 0");
      }

      const result = await client.query(sql, params);

      if (!transactionClient) {
        await client.query("COMMIT");
      }

      // Log query performance
      const duration = Date.now() - startTime;
      if (duration > 1000) {
        // Log slow queries
        Logger.warn("Slow query detected", {
          query: sql.substring(0, 100) + "...",
          duration: `${duration}ms`,
          poolStatus: this.getPoolStatus(),
        });
      }

      if (singleRow) {
        return result.rows[0] as T;
      }
      return result.rows as T;
    } catch (error) {
      if (!transactionClient) {
        await client.query("ROLLBACK");
      }

      Logger.error("Database query error", {
        error,
        query: sql.substring(0, 100) + "...",
        params: params.map((p) => p?.toString?.() || String(p)).join(", "),
        poolStatus: this.getPoolStatus(),
      });
      throw error;
    } finally {
      if (!transactionClient) {
        client.release();
      }
    }
  }

  /**
   * Execute database queries in a transaction
   */
  static async transaction<T>(
    callback: (client: any) => Promise<T>
  ): Promise<T> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      Logger.error("Transaction error", { error });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Build a query with conditional clauses
   */
  static buildQuery(
    baseQuery: string,
    conditions: Array<{
      condition: boolean;
      sql: string;
      params: any[];
    }>,
    suffix?: string
  ): { sql: string; params: any[] } {
    let sql = baseQuery;
    let params: any[] = [];
    let paramIndex = 1;
    const whereClauses: string[] = [];

    conditions.forEach(
      ({ condition, sql: conditionSql, params: conditionParams }) => {
        if (condition) {
          // Replace placeholder parameter indices with actual indices
          const adjustedSql = conditionSql.replace(
            /\$\?/g,
            () => `$${paramIndex++}`
          );
          whereClauses.push(adjustedSql);
          params = [...params, ...conditionParams];
        }
      }
    );

    if (whereClauses.length > 0) {
      sql += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    if (suffix) {
      sql += ` ${suffix}`;
    }

    return { sql, params };
  }

  /**
   * Execute query with INTERVAL support for PostgreSQL
   * Handles INTERVAL parameters that can't be parameterized normally
   */
  static async queryWithInterval<T>(
    baseQuery: string,
    intervalValue: string,
    otherParams: any[] = [],
    options: QueryOptions = {}
  ): Promise<T> {
    // Validate interval value against whitelist
    const validIntervals = [
      "1 month",
      "2 months",
      "3 months",
      "6 months",
      "1 year",
      "1 week",
      "2 weeks",
    ];

    if (!validIntervals.includes(intervalValue)) {
      throw new Error(`Invalid interval value: ${intervalValue}`);
    }

    // Replace placeholder with validated interval
    const sql = baseQuery.replace("{{INTERVAL}}", intervalValue);

    return this.query<T>(sql, { ...options, params: otherParams });
  }
}
