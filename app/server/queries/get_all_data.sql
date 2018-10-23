SELECT
  (SELECT array_to_json(array_agg(collections ORDER BY id ASC)) FROM collections) AS collections,
  (SELECT array_to_json(array_agg(artists ORDER BY name ASC)) FROM artists)       AS artists,
  (SELECT array_to_json(array_agg(labels ORDER BY name ASC)) FROM labels)         AS labels;