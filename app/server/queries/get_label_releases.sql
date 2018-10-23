SELECT er.*
  FROM label_releases z
  JOIN expanded_releases er ON er.id = z.release_id
 WHERE z.label_id = {{ LABEL_ID }}
 ORDER BY er.title, er.year;