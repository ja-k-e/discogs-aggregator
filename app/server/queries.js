const queries = {
  getAllData: () => `
    SELECT
      (SELECT array_to_json(array_agg(collections ORDER BY id ASC)) FROM collections) AS collections,
      (SELECT array_to_json(array_agg(artists ORDER BY name ASC)) FROM artists) AS artists,
      (SELECT array_to_json(array_agg(labels ORDER BY name ASC)) FROM labels) AS labels;
  `,
  getArtists: () => `
    SELECT max(a.name) AS artist,
        sum(r.occurrences)::INT AS occurrences
      FROM (
        SELECT release_id,
            count(*) AS occurrences
          FROM collection_releases
        GROUP BY release_id
      ) r
      LEFT JOIN artist_releases ar ON ar.release_id = r.release_id
      LEFT JOIN artists a ON a.id = ar.artist_id
    GROUP BY a.id
   HAVING sum(r.occurrences) > 25
    ORDER BY sum(r.occurrences) DESC
  ;
  `,
  getReleaseGraph: releaseId => `
    SELECT
        release_id,
        max(er.title) AS title,
        max(er.year) AS year,
        er.formats,
        (json_agg(er.artists)->>0)::JSON AS artists,
        (json_agg(er.labels)->>0)::JSON AS labels,
        count(distinct collection_id)::INT AS collection_count
      FROM collection_releases
      LEFT JOIN expanded_releases er ON er.id = release_id
      WHERE collection_id IN (
        SELECT collection_id
          FROM collection_releases
         WHERE release_id = ${releaseId}
        )
      AND release_id != ${releaseId}
      GROUP BY release_id, er.formats
      ORDER BY count(distinct collection_id) DESC
      LIMIT 100;
  `,
  getArtistReleases: artistId => `
    SELECT er.*
      FROM artist_releases z
      JOIN expanded_releases er ON er.id = z.release_id
     WHERE z.artist_id = ${artistId}
     ORDER BY er.title, er.year
    ;
  `,
  getCollectionReleases: collectionId => `
    SELECT er.*
      FROM collection_releases z
      JOIN expanded_releases er ON er.id = z.release_id
     WHERE z.collection_id = '${collectionId}'
     ORDER BY er.title, er.year
    ;
  `,
  getLabelReleases: labelId => `
    SELECT er.*
      FROM label_releases z
      JOIN expanded_releases er ON er.id = z.release_id
     WHERE z.label_id = ${labelId}
     ORDER BY er.title, er.year
    ;
  `
};

module.exports = queries;
