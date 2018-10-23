const express = require("express");
const app = express();
const Routes = require("./server/components/Routes");

app.listen(3000, function() {
  console.log("listening on 3000");
});

app.get("/app.js", function(req, res) {
  res.sendFile(`${__dirname}/client/app.js`);
});
app.get("/components/browser.js", function(req, res) {
  res.sendFile(`${__dirname}/client/components/browser.js`);
});
app.get("/components/release.js", function(req, res) {
  res.sendFile(`${__dirname}/client/components/release.js`);
});

new Routes(app);
