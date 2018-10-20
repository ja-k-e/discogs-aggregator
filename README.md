# Discogs Aggregator

## Setup

- `yarn install`
- `createdb discogs_collections` we are using postgres.
- `touch secrets.json` then update it with your db connection settings and (optional) Discogs API token.
  - Providing a Discogs API `userToken` speeds up rate limiting to 60 per minute from 25.
  - `{ consumerKey: '...', consumerSecret: '...' }` will also work if you have them, but a `userToken` is more than enough.

```json
{
  "database": {
    "user": "<DB_USER>",
    "host": "localhost",
    "database": "discogs_collections",
    "password": "",
    "port": 5432
  },
  "discogs": {
    "userToken": "<OPTIONAL_API_TOKEN>"
  }
}
```

- `yarn setup` to initialize the database. This runs `structure.sql`.
  - Calling this again will delete all of your data. Be careful.
- Update `usernames.json` to be an array of usernames you want to scrape.
- `yarn populate` runs the dang thing.

## DB Structure

This uses four main tables to manage ripped data.

- **collections**: username and collection size
- **releases**: discogs id, title, year, formats (jsonb)
- **artists**: discogs id, name
- **labels**: discogs id, name

It has three join tables linking these records together.

- **collectionReleases**
- **artistReleases**
- **labelReleases**

## DB Interface

To find out the most collected artists between the users you have scraped, you would query something like this:

```sql
SELECT max(a.name) AS artist,
  sum(r.occurrences) AS occurrences
  FROM (
    SELECT release_id,
        count(*) AS occurrences
      FROM collection_releases
     GROUP BY release_id
  ) r
  LEFT JOIN artist_releases ar ON ar.release_id = r.release_id
  LEFT JOIN artists a ON a.id = ar.artist_id
 GROUP BY a.id
 ORDER BY sum(r.occurrences) DESC;
```

Which would yield something along the lines of:

| artist        | occurrences |
| ------------- | ----------- |
| Various       | 438         |
| Björk         | 296         |
| Radiohead     | 161         |
| Miles Davis   | 153         |
| St. Vincent   | 152         |
| The Beatles   | 138         |
| David Bowie   | 127         |
| The National  | 98          |
| John Coltrane | 88          |
| Bob Dylan     | 82          |

