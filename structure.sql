DROP TABLE IF EXISTS collections;
DROP TABLE IF EXISTS artists;
DROP TABLE IF EXISTS labels;
DROP TABLE IF EXISTS releases;
DROP TABLE IF EXISTS collection_releases;
DROP TABLE IF EXISTS artist_releases;
DROP TABLE IF EXISTS label_releases;

CREATE TABLE collections (
  id VARCHAR PRIMARY KEY NOT NULL,
  size INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE artists (
  id INTEGER PRIMARY KEY,
  name VARCHAR NOT NULL
);

CREATE TABLE labels (
  id INTEGER PRIMARY KEY,
  name VARCHAR NOT NULL
);

CREATE TABLE releases (
  id INTEGER PRIMARY KEY,
  title VARCHAR NOT NULL,
  year VARCHAR,
  formats JSONB
);
CREATE INDEX ON releases((formats->>'name'));
CREATE INDEX ON releases((formats->>'quantity'));

CREATE TABLE collection_releases (
  collection_id VARCHAR NOT NULL,
  release_id INTEGER NOT NULL
);
CREATE UNIQUE INDEX collection_releases_idx ON public.collection_releases USING btree (collection_id, release_id);

CREATE TABLE artist_releases (
  artist_id INTEGER NOT NULL,
  release_id INTEGER NOT NULL
);
CREATE UNIQUE INDEX artist_releases_idx ON public.artist_releases USING btree (artist_id, release_id);

CREATE TABLE label_releases (
  label_id INTEGER NOT NULL,
  release_id INTEGER NOT NULL
);
CREATE UNIQUE INDEX label_releases_idx ON public.label_releases USING btree (label_id, release_id);

CREATE MATERIALIZED VIEW expanded_releases AS
SELECT
    r.id,
    r.title,
    r.year::INT,
    r.formats,
    array_to_json(array_agg(distinct a)) AS artists,
    array_to_json(array_agg(distinct l)) AS labels,
    count(distinct collections.collection_id)::INT AS collection_count,
    array_agg(distinct collections.collection_id) AS collections
  FROM releases r
 INNER JOIN artist_releases ar ON r.id = ar.release_id
 INNER JOIN artists a ON a.id = ar.artist_id
 INNER JOIN label_releases lr ON r.id = lr.release_id
 INNER JOIN labels l ON l.id = lr.label_id
  LEFT JOIN collection_releases collections ON collections.release_id = r.id
 GROUP BY r.id, r.title, r.year, r.formats
 ORDER BY r.id;

CREATE MATERIALIZED VIEW collection_artists AS
SELECT
    cr.collection_id,
    ar.artist_id
  FROM collection_releases cr
  LEFT JOIN artist_releases ar ON ar.release_id = cr.release_id;
