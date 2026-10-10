const fs = require("node:fs");
const path = require("node:path");
const { Client } = require("pg");

const direction = process.argv[2] ?? "up";
if (!new Set(["up", "down"]).has(direction)) {
  throw new Error("Usage: node infra/migrations/migrate.cjs <up|down>");
}

const migrationDirectory = __dirname;
const migrationFiles = fs
  .readdirSync(migrationDirectory)
  .filter((file) => /^\d+_.+\.sql$/.test(file))
  .sort();

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/simsimplay",
  });
  await client.connect();
  try {
    await client.query(
      "CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())",
    );

    if (direction === "up") {
      for (const file of migrationFiles) {
        const applied = await client.query("SELECT 1 FROM schema_migrations WHERE name = $1", [file]);
        if (applied.rowCount) continue;
        const sql = fs.readFileSync(path.join(migrationDirectory, file), "utf8").split("-- migrate:down")[0];
        await client.query("BEGIN");
        try {
          await client.query(sql.replace("-- migrate:up", ""));
          await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
          await client.query("COMMIT");
          console.log(`Applied ${file}`);
        } catch (error) {
          await client.query("ROLLBACK");
          throw error;
        }
      }
    } else {
      const applied = await client.query("SELECT name FROM schema_migrations ORDER BY name DESC LIMIT 1");
      if (!applied.rowCount) return;
      const file = applied.rows[0].name;
      const sql = fs.readFileSync(path.join(migrationDirectory, file), "utf8").split("-- migrate:down")[1];
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("DELETE FROM schema_migrations WHERE name = $1", [file]);
        await client.query("COMMIT");
        console.log(`Rolled back ${file}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  } finally {
    await client.end();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});