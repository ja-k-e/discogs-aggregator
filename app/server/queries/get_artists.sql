SELECT
    max(a.name) AS artist,
    sum(r.occurrences)::INT AS occurrences
  FROM (
    SELECT release_id, count(*) AS occurrences
      FROM collection_releases
     GROUP BY release_id
  ) r
  LEFT JOIN artist_releases ar ON ar.release_id = r.release_id
  LEFT JOIN artists a ON a.id = ar.artist_id
 GROUP BY a.id
HAVING sum(r.occurrences) > 25
 ORDER BY sum(r.occurrences) DESC;