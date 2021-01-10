# Marker Monkey Server

This is the server application for Marker Monkey. It is a web app for storing and organizing bookmarks.
"Let the Monkey remember it for you!"

## Setting Up

- Install dependencies: `npm install`
- Create development and test databases: `createdb monkey`, `createdb monkey-test`
- Create database user: `createuser monkey`
- Grant privileges to new user in `psql`:
  - `GRANT ALL PRIVILEGES ON DATABASE monkey TO monkey`
  - `GRANT ALL PRIVILEGES ON DATABASE "monkey-test" TO monkey`
- Prepare environment file: `cp example.env .env`
- Replace values in `.env` with your custom values.
- Bootstrap development database: `npm run migrate`
- Bootstrap test database: `npm run migrate:test`

### Configuring Postgres

For tests involving time to run properly, your Postgres database must be configured to run in the UTC timezone.

1. Locate the `postgresql.conf` file for your Postgres installation.
   - OS X, Homebrew: `/usr/local/var/postgres/postgresql.conf`
2. Uncomment the `timezone` line and set it to `UTC` as follows:

```
# - Locale and Formatting -

datestyle = 'iso, mdy'
#intervalstyle = 'postgres'
timezone = 'UTC'
#timezone_abbreviations = 'Default'     # Select the set of available time zone
```

## Sample Data

- To seed the database for development: `psql -U monkey -d monkey -a -f seeds/seed.monkey_tables.sql`
- To clear seed data: `psql -U monkey -d monkey -a -f seeds/trunc.monkey_tables.sql`

## Scripts

- Start application for development: `npm run dev`
- Run tests: `npm test`
