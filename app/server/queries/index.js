const fs = require("fs");

const read = fileName => {
  return fs.readFileSync(`app/server/queries/${fileName}.sql`).toString();
};

const queries = {
  getAllData: () => read("get_all_data"),
  getArtist: id => read("get_artist").replace(/{{ ARTIST_ID }}/g, id),
  getArtistGraph: id =>
    read("get_artist_graph").replace(/{{ ARTIST_ID }}/g, id),
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
