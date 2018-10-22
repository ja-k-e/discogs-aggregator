const express = require("express");
const app = express();
const queries = require("./server/queries");
const Database = require("./server/components/Database");
const db = new Database();

app.listen(3000, function() {
  console.log("listening on 3000");
});

app.use(express.static(`${__dirname}/client`));

app.get("/api/all", (req, res) => {
  db.execute(queries.getAllData())
    .then(data => res.send(data.rows[0]))
    .catch(e => errorHandler(e, res));
});
app.get("/api/artist-occurrence", (req, res) => {
  db.execute(queries.getArtists())
    .then(data => res.send(data.rows))
    .catch(e => errorHandler(e, res));
});
app.get("/api/collection-releases", (req, res) => {
  db.execute(queries.getCollectionReleases(req.query.collectionId))
    .then(data => res.send(data.rows))
    .catch(e => errorHandler(e, res));
});
app.get("/api/release", (req, res) => {
  db.execute(
    `SELECT * FROM expanded_releases WHERE id = ${req.query.releaseId} LIMIT 1;`
  ).then(data => {
    let response = { release: data.rows[0], releases: null };
    db.execute(queries.getReleaseGraph(req.query.releaseId))
      .then(data => {
        response.releases = data.rows;
        res.send(response);
      })
      .catch(e => errorHandler(e, res));
  });
});
app.get("/api/label-releases", (req, res) => {
  db.execute(queries.getLabelReleases(req.query.labelId))
    .then(data => res.send(data.rows))
    .catch(e => errorHandler(e, res));
});
app.get("/api/artist-releases", (req, res) => {
  db.execute(queries.getArtistReleases(req.query.artistId))
    .then(data => res.send(data.rows))
    .catch(e => errorHandler(e, res));
});

function errorHandler(error, res) {
  res.status = 404;
  res.send({ error });
}
