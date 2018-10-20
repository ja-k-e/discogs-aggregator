const Database = require("./components/Database");
const fs = require("fs");
const sql = fs.readFileSync("structure.sql").toString();

new Database()
  .execute(sql)
  .then(res => {
    console.log(res);
    process.exit(0);
  })
  .catch(console.error);
