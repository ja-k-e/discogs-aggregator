SELECT
  (SELECT array_to_json(array_agg(collections ORDER BY id ASC)) FROM collections) AS collections,
  (SELECT array_to_json(array_agg(artists ORDER BY name ASC)) FROM artists)       AS artists,
  (SELECT array_to_json(array_agg(labels ORDER BY name ASC)) FROM labels)         AS labels,
  (SELECT array_to_json(array_agg(t)) FROM (
    SELECT id, id AS name, 'collection' AS type FROM collections
    UNION
    SELECT id::TEXT, name, 'label' AS type FROM labels
    UNION
    SELECT id::TEXT, name, 'artist' AS type FROM artists
  ) t) AS index;