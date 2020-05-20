const VaultSDK = require('node-vault');
const { Client: PostgresClient } = require('pg');

const vault_client = VaultSDK({
  apiVersion: 'v2',
  endpoint: process.env.VAULT_ADDR,
  token: process.env.VAULT_TOKEN // optional client token; can be fetched after valid initialization of the server
});

const run = async () => {
  console.log(process.env.DATABASE_USER_SECRET.split('#')[0]);
  const postgres_config = {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: await vault_client.read(process.env.DATABASE_USER_SECRET.split('#')[0]),
    password: await vault_client.read(process.env.DATABASE_PASSWORD_SECRET.split('#')[0]),
    database: await vault_client.read(process.env.DATABASE_NAME_SECRET.split('#')[0]),
  };
  const postgres_client = new PostgresClient(postgres_config);
  postgres_client.connect();

  // Create and seed table
  await postgres_client.query('CREATE TABLE users (id int, last_name varchar(255), first_name varchar(255)');
  await postgres_client.query('INSERT INTO users (id, last_name, first_name) VALUES (1, "User", "Test")');

  // Query seeded content
  const result = await postgres_client.query('SELECT * FROM users');
  console.log(result);

  // Drop table and kill connection
  await postgres_client.query('DROP TABLE users');
  await postgres_client.end();
};

run();