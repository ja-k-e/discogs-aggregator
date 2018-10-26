const Aggregator = require("./Aggregator");
const Database = require("./Database");
const db = new Database();
const sse = require("./sse");
const storedUsernames = require("../../../usernames.json");
const fs = require("fs");
const {
  getAllData,
  getArtist,
  getArtistGraph,
  getArtistReleases,
  getCollectionReleases,
  getCollections,
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
    this.app.use(sse);
    this.initialize();
  }

  async initialize() {
    await this.initializeViews();
    await this.initializeApi();
  }

  async initializeViews() {
    await this.initializeViewRoot();
    await this.initializeViewServer();
    await this.initializeViewArtist();
    await this.initializeViewRelease();
  }

  async initializeApi() {
    await this.initializeApiArtistReleases();
    await this.initializeApiCollectionReleases();
    await this.initializeApiLabelReleases();
    await this.initializeApiPopulate();
  }

  async initializeViewRoot() {
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

  async initializeViewServer() {
    const callback = async (req, res) => {
      const data = { type: "server" };
      const { rows } = await db.execute(getCollections());
      const allData = { collections: rows };
      data.payload = allData;
      res.send(this.injectData(data));
    };
    this.app.get("/server", am(callback));
  }

  async initializeViewArtist() {
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

  async initializeViewRelease() {
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

  // https://www.terlici.com/2015/12/04/realtime-node-expressjs-with-sse.html
  async initializeApiPopulate() {
    this.app.get("/api/populate", (req, res, next) => {
      const connections = [];
      const usernames = req.query.ids
        .split(",")
        .map(i => decodeURIComponent(i));
      res.sseSetup();
      const aggregator = new Aggregator(usernames, d => {
        console.log(d);
        res.sseSend({ type: "message", payload: d });
      });
      aggregator
        .run()
        .then(data => {
          connections.push(res);
          res.sseSend({ type: "complete", payload: "Complete!" });
        })
        .catch(e => res.sseSend({ type: "error", payload: e.message }));
    });
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
