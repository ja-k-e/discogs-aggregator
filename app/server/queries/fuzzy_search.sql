SELECT
    id AS id,
    lower({{ COL }}) AS name,
    '{{ TYPE }}' AS type
  FROM {{ TYPE }}s
 WHERE lower({{ COL }}) LIKE '%{{ TERM }}%'
 ORDER BY levenshtein(left(lower({{ COL }}), 255), '{{ TERM }}')
 LIMIT 15
;