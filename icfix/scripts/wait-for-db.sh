#!/usr/bin/env sh
set -e

HOST="${POSTGRES_HOST:-postgres}"
PORT="${POSTGRES_PORT:-5432}"

echo "Waiting for Postgres at $HOST:$PORT..."
until nc -z "$HOST" "$PORT"; do
  sleep 1
done

echo "Postgres is up."


