SELECT r.occurrences,
    r.release_id,
    max(releases.title) AS title,
    array_agg(artists.name) AS artists,
    array_agg(labels.name) AS labels
  FROM (
    SELECT release_id, count(*) AS occurrences
      FROM collection_releases
     GROUP BY release_id
  ) r
  LEFT JOIN releases ON releases.id = r.release_id
  LEFT JOIN artist_releases ON releases.id = artist_releases.release_id
  LEFT JOIN artists ON artists.id = artist_releases.artist_id
  LEFT JOIN label_releases ON releases.id = label_releases.release_id
  LEFT JOIN labels ON labels.id = label_releases.label_id
 GROUP BY r.occurrences, r.release_id
 ORDER BY r.occurrences DESC
;
