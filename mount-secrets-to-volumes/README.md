# Cycling application credentials without cycling containers

This repository contains the source code associated with Architect's blog post on
cycling application credentials without cycling containers.

https://architect.io/blog/cycling-credentials-without-cycling-containers

## Deploying

We've written an [Architect Component](https://www.architect.io/docs/getting-started/core-concepts/)
for the application so that it can be deployed automatically alongside it's database.
The component also seeds the database secret file with the root credentials assigned
for the postgres instance.

To run the application, simply stand up an environment locally from the `environment.yml`
file:

```sh
$ npm install -g @architect-io/cli
$ architect deploy --local environment.yml
```
