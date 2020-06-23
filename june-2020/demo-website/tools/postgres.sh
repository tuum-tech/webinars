#!/bin/bash

docker container stop demo-website-postgres || true && docker container rm -f demo-website-postgres || true

# start a postgres docker container
docker run -d --name demo-website-postgres \
    -v "$PWD/.postgres-data:/var/lib/postgresql/data"     \
    -e POSTGRES_DB=demo-website                             \
    -e POSTGRES_USER=demo                                \
    -e POSTGRES_PASSWORD=demo                            \
    -p 5432:5432                                        \
    postgres:11-alpine