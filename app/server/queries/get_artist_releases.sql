SELECT er.*
  FROM artist_releases z
  JOIN expanded_releases er ON er.id = z.release_id
 WHERE z.artist_id = {{ ARTIST_ID }}
 ORDER BY er.title, er.year;