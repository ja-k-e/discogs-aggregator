const express = require("express");
const app = express();
const queries = require("./server/queries");
const Database = require("./server/components/Database");
const db = new Database();

app.listen(3000, function() {
  console.log("listening on 3000");
});

app.use(express.static(`${__dirname}/client`));
app.get("/all", function(req, res) {
  db.execute(queries.getAllData())
    .then(data => {
      res.send(data.rows[0]);
    })
    .catch(e => errorHandler(e, res));
});
app.get("/collection", function(req, res) {
  db.execute(queries.getCollectionReleases(req.query.collectionId))
    .then(data => {
      res.send(data.rows);
    })
    .catch(e => errorHandler(e, res));
});
app.get("/label", function(req, res) {
  db.execute(queries.getLabelReleases(req.query.labelId))
    .then(data => {
      res.send(data.rows);
    })
    .catch(e => errorHandler(e, res));
});
app.get("/artist", function(req, res) {
  db.execute(queries.getArtistReleases(req.query.artistId))
    .then(data => {
      res.send(data.rows);
    })
    .catch(e => errorHandler(e, res));
});

function errorHandler(error, res) {
  res.status = 404;
  res.send({ error });
}
