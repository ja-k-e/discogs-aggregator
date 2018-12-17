SELECT
    release_id,
    max(er.title) AS title,
    max(er.year) AS year,
    er.formats,
    (json_agg(er.artists)->>0)::JSON AS artists,
    (json_agg(er.labels)->>0)::JSON AS labels,
    count(DISTINCT collection_id)::INT AS collection_count
  FROM collection_releases
  LEFT JOIN expanded_releases er ON er.id = release_id
 WHERE collection_id IN (
    SELECT collection_id
      FROM collection_releases
     WHERE release_id = {{ RELEASE_ID }}
    ) AND release_id != {{ RELEASE_ID }}
 GROUP BY release_id, er.formats
HAVING count(DISTINCT collection_id)::INT >= (
  SELECT min(count) FROM (
    SELECT count(DISTINCT collection_id)::INT AS count
      FROM collection_releases
     WHERE collection_id IN (
       SELECT DISTINCT collection_id
         FROM collection_releases
        WHERE release_id = {{ RELEASE_ID }}
     ) AND release_id != {{ RELEASE_ID }}
     GROUP BY release_id
     ORDER BY count(DISTINCT collection_id) DESC
     LIMIT 50
  ) tmp
)
 ORDER BY count(DISTINCT collection_id) DESC, max(er.title), max(er.year)
 LIMIT 100;