# Marker Monkey

_"Let the Monkey remember it for you!"_

![Mockup-greybackground](https://user-images.githubusercontent.com/64292589/105615134-39be8280-5d9c-11eb-968e-7f07afe28312.png)

This is the server side of Marker Monkey, a bookmarking web app.

The client side repo is at [github.com/tim-hanke/marker-monkey-client](https://github.com/tim-hanke/marker-monkey-client).

The live version is hosted at [marker-monkey-client.vercel.app](https://marker-monkey-client.vercel.app/).

## Why?

I wanted a simple, visually-appealing way to keep track of things I wanted to read online, but didn't have time to read in the moment.

After registering for an account, a user can bookmark a webpage by pasting an URL into the Add Article page on Marker Monkey. Marker Monkey will then attempt to retrieve an image, title, description, and canonical URL for the page and save that info for that user. When viewing their list of saved articles, the user can open them in a new window or delete them from their list.

## Technical Details

### Endpoints

#### `POST /api/users`

To register a new user. Accepts `full_name`, `user_name`, and `password` in the request body and if successful returns `full_name`, `user_name`, and an `id` assigned by the server.

#### `POST /api/auth/login`

To log in an existing user. Accepts `user_name` and `password` in the request body and if successful returns `authToken`, a JSON Web Token.

#### `POST /api/articles`

##### _requires Authentication header_

To add an URL to database. Accepts `target_url` in the request body and if successful returns `id`, `user_id`, and `article_id` of the saved user article.

#### `GET /api/articles`

##### _requires Authentication header_

Returns all saved articles (each containing `id`, `url`, `image`, `title`, and `description`) for the user authorized in the Authentication header.

#### `DELETE /api/user_articles`

##### _requires Authentication header_

To delete an article from the user's saved articles. Accepts `article_id` in the request body and if successful returns `id` of the deleted user article.

### Setting Up

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
