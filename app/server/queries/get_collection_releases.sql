SELECT er.*
  FROM collection_releases z
  JOIN expanded_releases er ON er.id = z.release_id
 WHERE z.collection_id = '{{ COLLECTION_ID }}'
 ORDER BY er.title, er.year;