// Local Postgres for development (a real server binary from npm — no Docker/Homebrew needed).
// Run: npm run db:start   Data persists in ./.data/pg. Production uses DATABASE_URL (Neon/Supabase).
import fs from "node:fs";
import EmbeddedPostgres from "embedded-postgres";

const databaseDir = "./.data/pg";
const firstRun = !fs.existsSync(`${databaseDir}/PG_VERSION`);

const pg = new EmbeddedPostgres({ databaseDir, port: 5433, user: "postgres", password: "postgres", persistent: true });

async function main() {
  if (firstRun) await pg.initialise();
  await pg.start();
  console.log("Postgres ready on postgres://postgres:postgres@127.0.0.1:5433/postgres");
  const stop = async () => {
    await pg.stop();
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
