const RELEASE_SELECT = `
  SELECT
    r.id,
    r.title,
    r.year,
    r.formats,
    count(counts) AS collection_count,
    array_to_json(array_agg(distinct a)) AS artists,
    array_to_json(array_agg(distinct l)) AS labels
`;

const RELEASE_JOINS = `
  INNER JOIN releases r ON r.id = z.release_id
  INNER JOIN artist_releases ar ON r.id = ar.release_id
  INNER JOIN artists a ON a.id = ar.artist_id
  INNER JOIN label_releases lr ON r.id = lr.release_id
  INNER JOIN labels l ON l.id = lr.label_id
  LEFT JOIN collection_releases counts ON counts.release_id = r.id
`;

const RELEASE_GROUP_ORDER = `
GROUP BY r.id, r.title, r.year, r.formats
ORDER BY r.title, r.year
`;

const queries = {
  getAllData: () => `
    SELECT
      (SELECT array_to_json(array_agg(collections ORDER BY id ASC)) FROM collections) AS collections,
      (SELECT array_to_json(array_agg(artists ORDER BY name ASC)) FROM artists) AS artists,
      (SELECT array_to_json(array_agg(labels ORDER BY name ASC)) FROM labels) AS labels;
  `,
  getArtistReleases: artistId => `
    ${RELEASE_SELECT}
      FROM artist_releases z
     ${RELEASE_JOINS}
     WHERE z.artist_id = ${artistId}
     ${RELEASE_GROUP_ORDER}
    ;
  `,
  getCollectionReleases: collectionId => `
    ${RELEASE_SELECT}
      FROM collection_releases z
     ${RELEASE_JOINS}
     WHERE z.collection_id = '${collectionId}'
     ${RELEASE_GROUP_ORDER}
    ;
  `,
  getLabelReleases: labelId => `
    ${RELEASE_SELECT}
      FROM label_releases z
     ${RELEASE_JOINS}
     WHERE z.label_id = ${labelId}
     ${RELEASE_GROUP_ORDER}
    ;
  `
};

module.exports = queries;
