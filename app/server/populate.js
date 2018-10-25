const Aggregator = require("./components/Aggregator");
const fs = require("fs");
// st vincent. https://www.discogs.com/release/stats/11256980#collection
// breaking atoms. https://www.discogs.com/release/stats/9816263#collection
// sumney lamentations. https://www.discogs.com/release/stats/9552940#collection
// nick cave boatman. https://www.discogs.com/release/stats/10213764#collection
const USERNAMES = JSON.parse(fs.readFileSync("usernames.json").toString());
// const USERNAMES = ["jakealbaugh"];

const aggregator = new Aggregator(USERNAMES, console.log);
aggregator
  .run()
  .then(console.log)
  .catch(e => {
    console.error(e);
    process.exit(0);
  });
