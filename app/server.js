require("colors");
const express = require("express");
const app = express();
const Routes = require("./server/components/Routes");

app.listen(3000, function() {
  console.log("listening on 3000");
});

app.get("/app.js", function(req, res) {
  res.sendFile(`${__dirname}/client/app.js`);
});
app.use("/components", express.static(`${__dirname}/client/components`));

const initialize = async () => await new Routes(app);
initialize().then(() => {
  console.log("Initialized Server!".blue);
});
