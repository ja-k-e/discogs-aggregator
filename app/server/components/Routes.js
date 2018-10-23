const Database = require("./Database");
const db = new Database();
const queries = require("../queries");
const fs = require("fs");
const cheerio = require("cheerio");

class Routes {
  constructor(app) {
    this.app = app;
    this.initialize();
  }

  initialize() {
    this.initializeRoot();
    this.initializeRelease();
    this.app.get("/api/collection-releases", (req, res) => {
      db.execute(queries.getCollectionReleases(req.query.collectionId))
        .then(data => res.send(data.rows))
        .catch(e => this.errorHandler(e, res));
    });
    this.app.get("/api/label-releases", (req, res) => {
      db.execute(queries.getLabelReleases(req.query.labelId))
        .then(data => res.send(data.rows))
        .catch(e => this.errorHandler(e, res));
    });
    this.app.get("/api/artist-releases", (req, res) => {
      db.execute(queries.getArtistReleases(req.query.artistId))
        .then(data => res.send(data.rows))
        .catch(e => this.errorHandler(e, res));
    });
  }

  initializeRoot() {
    this.app.get("/", (req, res) => {
      let data = { type: "browser" };
      db.execute(queries.getAllData())
        .then(response => {
          data.payload = response.rows[0];
          db.execute(
            queries.getCollectionReleases(data.payload.collections[0].id)
          )
            .then(response => {
              data.payload.releases = response.rows;
              res.send(this.injectData(data));
            })
            .catch(e => console.error(e, res));
        })
        .catch(e => console.error(e, res));
    });
  }

  initializeRelease() {
    let data = { type: "release" };
    this.app.get("/release/:releaseId", (req, res) => {
      db.execute(
        `SELECT * FROM expanded_releases WHERE id = ${
          req.params.releaseId
        } LIMIT 1;`
      )
        .then(response => {
          data.payload = { release: response.rows[0] };
          db.execute(queries.getReleaseGraph(req.params.releaseId))
            .then(response => {
              data.payload.releases = response.rows;
              res.send(this.injectData(data));
            })
            .catch(e => this.errorHandler(e, res));
        })
        .catch(e => this.errorHandler(e, res));
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
