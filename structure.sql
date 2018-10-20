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
