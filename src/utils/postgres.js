import { Pool } from "pg";

export const pool = new Pool({
  host: process.env.PG_HOST_NAME,
  port: process.env.PG_PORT_NUMBER,
  user: process.env.PG_USER_NAME,
  database: process.env.PG_DB_NAME,
  password: process.env.PG_DB_PASSWORD,
});

export default async function dbConnect() {
  await pool.connect((err, client, release) => {
    if (err) {
      return console.err("Error in connection", err.stack);
    }
    client.query("SELECT NOW()", (err, result) => {
      release();
      if (err) {
        return console.err("Error in query execution", err.stack);
      }
      console.log("Connect to database...", result.rows[0].now);
    });
  });
}
