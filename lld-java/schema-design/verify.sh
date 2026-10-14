#!/usr/bin/env bash
# Starts a throwaway PostgreSQL cluster in a temp directory, loads schema.sql, runs checks.sql, then deletes it.
# Needs PostgreSQL 13+ binaries (initdb, pg_ctl, psql) on PATH or under Homebrew.
set -euo pipefail
cd "$(dirname "$0")"
for dir in /opt/homebrew/opt/postgresql@15/bin /opt/homebrew/opt/postgresql@16/bin /usr/lib/postgresql/15/bin; do
  [ -x "$dir/initdb" ] && PATH="$dir:$PATH"
done
DATA=$(mktemp -d)
PORT=${PGPORT_TEST:-54329}
trap 'pg_ctl -D "$DATA" -m immediate stop >/dev/null 2>&1 || true; rm -rf "$DATA"' EXIT
initdb -D "$DATA" -U postgres --auth=trust >/dev/null
pg_ctl -D "$DATA" -o "-p $PORT -k $DATA -c listen_addresses=''" -l "$DATA/log" start >/dev/null
psql -h "$DATA" -p "$PORT" -U postgres -q -v ON_ERROR_STOP=1 -f schema.sql
psql -h "$DATA" -p "$PORT" -U postgres -q -v ON_ERROR_STOP=1 -o /dev/null -f checks.sql 2>&1 | sed -e 's/^psql:checks.sql:[0-9]*: NOTICE:  //'
