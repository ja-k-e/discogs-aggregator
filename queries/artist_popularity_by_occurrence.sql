SELECT max(a.name) AS artist,
  sum(r.occurrences) AS occurrences
  FROM (
    SELECT release_id,
        count(*) AS occurrences
      FROM collection_releases
     GROUP BY release_id
  ) r
  LEFT JOIN artist_releases ar ON ar.release_id = r.release_id
  LEFT JOIN artists a ON a.id = ar.artist_id 
 GROUP BY a.id
 ORDER BY sum(r.occurrences) DESC
;

select * from collection_releases where release_id in (
  select release_id from artist_releases where artist_id = (
    select id from artists where name = 'Radiohead'
  )
);
