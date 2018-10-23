SELECT
    artist_id,
    max(a.name) AS name,
    count(distinct collection_id)::INT AS collection_count
  FROM collection_artists
  LEFT JOIN artists a ON a.id = artist_id
 WHERE collection_id IN (
    SELECT collection_id
      FROM collection_artists
     WHERE artist_id = {{ ARTIST_ID }}
    )
   AND artist_id != {{ ARTIST_ID }}
 GROUP BY artist_id
 ORDER BY count(distinct collection_id) DESC
 LIMIT 50;