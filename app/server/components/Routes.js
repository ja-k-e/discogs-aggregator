const Database = require("./Database");
const db = new Database();
const fs = require("fs");
const {
  getAllData,
  getArtist,
  getArtistGraph,
  getArtistReleases,
  getCollectionReleases,
  getLabelReleases,
  getRelease,
  getReleaseGraph
} = require("../queries");

const am = fn => (req, res) => {
  Promise.resolve(fn(req, res)).catch(console.error);
};

class Routes {
  constructor(app) {
    this.app = app;
    this.initialize();
  }

  async initialize() {
    await this.initializeViews();
    await this.initializeApi();
  }

  async initializeViews() {
    await this.initializeRoot();
    await this.initializeArtist();
    await this.initializeRelease();
  }

  async initializeApi() {
    await this.initializeApiArtistReleases();
    await this.initializeApiCollectionReleases();
    await this.initializeApiLabelReleases();
  }

  async initializeRoot() {
    const callback = async (req, res) => {
      const data = { type: "browser" };
      const allData = await db.execute(getAllData());
      data.payload = allData.rows[0];
      const releaseQ = getCollectionReleases(data.payload.collections[0].id);
      const releases = await db.execute(releaseQ);
      data.payload.releases = releases.rows;
      res.send(this.injectData(data));
    };
    this.app.get("/", am(callback));
  }

  async initializeArtist() {
    const callback = async (req, res) => {
      const data = { type: "artist" };
      const artist = await db.execute(getArtist(req.params.artistId));
      data.payload = { artist: artist.rows[0] };
      const graph = await db.execute(getArtistGraph(req.params.artistId));
      data.payload.artists = graph.rows;
      res.send(this.injectData(data));
    };
    this.app.get("/artist/:artistId", am(callback));
  }

  async initializeRelease() {
    const callback = async (req, res) => {
      const data = { type: "release" };
      const release = await db.execute(getRelease(req.params.releaseId));
      data.payload = { release: release.rows[0] };
      const graph = await db.execute(getReleaseGraph(req.params.releaseId));
      data.payload.releases = graph.rows;
      res.send(this.injectData(data));
    };
    this.app.get("/release/:releaseId", am(callback));
  }

  async initializeApiArtistReleases() {
    const callback = async (req, res) => {
      const releases = await db.execute(getArtistReleases(req.query.artistId));
      res.send(releases.rows);
    };
    this.app.get("/api/artist-releases", am(callback));
  }

  async initializeApiCollectionReleases() {
    const callback = async (req, res) => {
      const releases = await db.execute(
        getCollectionReleases(req.query.collectionId)
      );
      res.send(releases.rows);
    };
    this.app.get("/api/collection-releases", am(callback));
  }

  async initializeApiLabelReleases() {
    const callback = async (req, res) => {
      const releases = await db.execute(getLabelReleases(req.query.labelId));
      res.send(releases.rows);
    };
    this.app.get("/api/label-releases", am(callback));
  }

  injectData(data) {
    const html = fs.readFileSync(`app/client/view.html`, "utf8");
    data = encodeURIComponent(JSON.stringify(data));
    return html.replace(
      /id="payload" value=""/,
      `id="payload" value="${data}"`
    );
  }

  errorHandler(error, res) {
    res.status = 404;
    res.send({ error });
  }
}

module.exports = Routes;
