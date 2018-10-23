SELECT
    max(a.name) AS name,
    count(distinct cr.collection_id) AS collection_count,
    count(cr.release_id) AS collected_count,
    count(distinct cr.release_id) AS release_count,
    (SELECT json_agg(expanded_releases) FROM expanded_releases WHERE id IN (
      SELECT DISTINCT release_id FROM artist_releases WHERE artist_id = {{ ARTIST_ID }}
    )) AS releases
  FROM artists a
  LEFT JOIN collection_releases cr ON cr.release_id IN (
    SELECT release_id
      FROM artist_releases
     WHERE artist_id = {{ ARTIST_ID }}
  )

 WHERE a.id = {{ ARTIST_ID }}
 LIMIT 1;
