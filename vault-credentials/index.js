const VaultSDK = require('node-vault');
const { Client: PostgresClient } = require('pg');

const vault_client = VaultSDK({
  apiVersion: 'v1',
  endpoint: process.env.VAULT_ADDR,
  token: process.env.VAULT_TOKEN // optional client token; can be fetched after valid initialization of the server
});

// We're passing in a structured syntax to point to each secret key uniquely to
// allow us to parameterize the database credentials as separate values:
// (e.g. export DATABASE_USER_SECRET = 'secret/database#user')
const readVaultSecret = async (secret) => {
  const prefix = secret.substring(0, secret.lastIndexOf('/'));
  const name = secret.substring(secret.lastIndexOf('/') + 1, secret.indexOf('#') >= 0 ? secret.indexOf('#') : undefined);
  const key = secret.substring(secret.indexOf('#') + 1);
  const res = await vault_client.read(`${prefix}/data/${name}`);
  return res.data.data[key];
};

const run = async () => {
  const postgres_config = {
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    user: await readVaultSecret(process.env.DATABASE_USER_SECRET),
    password: await readVaultSecret(process.env.DATABASE_PASSWORD_SECRET),
    database: await readVaultSecret(process.env.DATABASE_NAME_SECRET),
  };
  const postgres_client = new PostgresClient(postgres_config);
  await postgres_client.connect();

  // Create and seed table
  await postgres_client.query('CREATE TABLE users (id int, last_name varchar(255), first_name varchar(255))');
  await postgres_client.query('INSERT INTO users (id, last_name, first_name) VALUES (1, \'User\', \'Test\')');

  // Query seeded content
  const result = await postgres_client.query('SELECT * FROM users');
  console.log(JSON.stringify(result.rows, null, 2));

  // Drop table and kill connection
  await postgres_client.query('DROP TABLE users');
  await postgres_client.end();
};

run();