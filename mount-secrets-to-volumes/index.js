const fs = require("fs");
const { Client: PostgresClient } = require("pg");

// Configure how much time can pass before the credentials will be
// considered stale and need to be refreshed
const DB_CREDENTIALS_TTL = process.env.DB_CREDENTIALS_TTL || 5 * 60 * 1000;

let postgres_client;
let client_expires_on;

const getPostgresClient = () => {
  if (!postgres_client || client_expires_on < Date.now()) {
    const raw_secret = fs.readFileSync(process.env.DB_CREDENTIALS_FILE);
    const { user, password, database } = JSON.parse(raw_secret);

    const postgres_config = {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      user,
      password,
      database,
    };

    postgres_client = new PostgresClient(postgres_config);
    client_expires_on = Date.now() + DB_CREDENTIALS_TTL;
  }

  return postgres_client;
};

const testDBConnection = async () => {
  const db = getPostgresClient();

  db.connect();

  // Create and seed table
  await db.query(
    "CREATE TABLE users (id int, last_name varchar(255), first_name varchar(255))"
  );
  await db.query(
    "INSERT INTO users (id, last_name, first_name) VALUES (1, 'User', 'Test')"
  );

  // Query seeded content
  const result = await db.query("SELECT * FROM users");
  console.log(result.rows);

  // Drop table and kill connection
  await db.query("DROP TABLE users");
  await db.end();
};

testDBConnection();
