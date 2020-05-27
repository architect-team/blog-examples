# Managing secrets with Hashicorp Vault

## Install and run vault

1. [Install the CLI](https://learn.hashicorp.com/vault/getting-started/install)
2. [Run the dev server](https://learn.hashicorp.com/vault/getting-started/dev-server)

## Create the database secrets

```sh
$ vault kv put secret/database user=postgres password=postgres name=test
```

## Run the service

First, create a token that can be used to access the vault:

```sh
$ vault token create
```

### Using Architect

The vault token you just created needs to be provided to the application. You can do this by setting the 
`VAULT_TOKEN` parameter inside `arc.env.yml`. Then, run the following to start the database and service:

```sh
$ architect deploy --local arc.env.yml
```

### Using Docker

First, create a postgres instance for your service to connect to. Be sure to provide it the credentials
you put into your vault:

```sh
$ docker run -p 50000:5432 \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_DB=test \
    postgres:11
```

Next, start the service and reference the secret you created in your vault:

```sh
$ npm install
# Be sure to replace `VAULT_TOKEN` with the token you created earlier
$ VAULT_TOKEN=<...> \
    VAULT_ADDR=http://localhost:8200 \
    DATABASE_USER_SECRET=secret/database#user \
    DATABASE_PASSWORD_SECRET=secret/database#password \
    DATABASE_NAME_SECRET=secret/database#name \
    npm start
```