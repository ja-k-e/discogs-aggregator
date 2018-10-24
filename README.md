# Discogs Aggregator

Aggregating Discogs data to determine which Artists are often collected with other Artists and which Releases are often collected with other Releases.

## Setup

- `yarn install`
- `createdb discogs_collections` we are using postgres.
- `touch secrets.json` then update it with your db connection settings and (optional) Discogs API token.
  - Providing a Discogs API `userToken` ups rate limiting from 25 per minute to 60, practically preventing you from hitting a rate limit.
  - `discogs: { consumerKey: '...', consumerSecret: '...' }` will also work if you have them, but a `userToken` is more than enough.

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

## Client

After populating your database, you can start the client with `yarn serve`.
Then visit [localhost:3000](http://localhost:3000). From here you can search for Collections, Artists, or Labels.

Clicking an Artist name will take you to the Artist page which contains all Releases in the database for that Artist as well as data for which Artists are most often collected with that Artist.

Clicking a Release name will take you to the Release page which contains Release metadata as well as data for which Releases are most often collected with that Release.