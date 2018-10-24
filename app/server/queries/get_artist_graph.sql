SELECT
    artist_id,
    max(a.name) AS name,
    count(DISTINCT collection_id)::INT AS collection_count
  FROM collection_artists
  LEFT JOIN artists a ON a.id = artist_id
 WHERE collection_id IN (
    SELECT collection_id
      FROM collection_artists
     WHERE artist_id = {{ ARTIST_ID }}
    ) AND artist_id != {{ ARTIST_ID }}
 GROUP BY artist_id
HAVING count(DISTINCT collection_id) >= (
  SELECT min(count) FROM (
    SELECT count(DISTINCT collection_id)::INT AS count
      FROM collection_artists
     WHERE collection_id IN (
        SELECT DISTINCT collection_id
          FROM collection_artists
         WHERE artist_id = {{ ARTIST_ID }}
     ) AND artist_id != {{ ARTIST_ID }}
     GROUP BY artist_id
     ORDER BY count(DISTINCT collection_id) DESC
     LIMIT 50
  ) tmp
)
 ORDER BY count(DISTINCT collection_id) DESC, max(a.name)
 LIMIT 500;