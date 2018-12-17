const fs = require("fs");

const read = fileName => {
  return fs.readFileSync(`app/server/queries/${fileName}.sql`).toString();
};

const queries = {
  fuzzySearch: (term, type) => {
    const col = {
      collection: "id",
      label: "name",
      artist: "name",
      release: "title"
    }[type];
    return read("fuzzy_search")
      .replace(/{{ TERM }}/g, term)
      .replace(/{{ COL }}/g, col)
      .replace(/{{ TYPE }}/g, type);
  },
  getAllData: () => read("get_all_data"),
  getArtist: id => read("get_artist").replace(/{{ ARTIST_ID }}/g, id),
  getArtistGraph: id =>
    read("get_artist_graph").replace(/{{ ARTIST_ID }}/g, id),
  getCollection: id =>
    read("get_collection").replace(/{{ COLLECTION_ID }}/g, id),
  getCollections: () => read("get_collections"),
  getLabel: id => read("get_label").replace(/{{ LABEL_ID }}/g, id),
  getRelease: id => read("get_release").replace(/{{ RELEASE_ID }}/g, id),
  getReleaseGraph: id =>
    read("get_release_graph").replace(/{{ RELEASE_ID }}/g, id),
  getArtistReleases: id =>
    read("get_artist_releases").replace(/{{ ARTIST_ID }}/g, id),
  getCollectionReleases: id =>
    read("get_collection_releases").replace(/{{ COLLECTION_ID }}/g, id),
  getLabelReleases: id =>
    read("get_label_releases").replace(/{{ LABEL_ID }}/g, id)
};

module.exports = queries;
