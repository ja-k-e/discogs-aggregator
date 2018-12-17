require("colors");
const Collection = require("./Collection");
const Database = require("./Database");

class Aggregator {
  constructor(usernames, messenger) {
    this.usernames = usernames;
    this.messenger = messenger;
    this.users = this.usernames.length;
    this.database = new Database();
  }

  run() {
    this.messenger(`🤞  Processing ${this.users} User(s).`.green.bold);
    return new Promise((resolve, reject) => {
      this.processUser()
        .then(() => {
          this.messenger(
            `Refreshing Views. This might take awhile.`.green.bold
          );
          this.database
            .refreshMaterializedViews()
            .then(() => resolve())
            .catch(reject);
        })
        .catch(reject);
    });
  }

  processUser(user = 0) {
    return new Promise((resolve, reject) => {
      let username = this.usernames[user];
      this.messenger(`${username} (${user + 1} of ${this.users})`.blue.bold);
      this._getUserCollection(username)
        .then(collection => {
          this.database
            .upsertCollection(collection)
            .then(() => {
              user++;
              if (user < this.users) resolve(this.processUser(user));
              else resolve();
            })
            .catch(reject);
        })
        .catch(reject);
    });
  }

  _getUserCollection(username) {
    return new Promise((resolve, reject) => {
      const collection = new Collection(username, this.messenger);
      collection
        .prepare()
        .then(() => {
          collection
            .run()
            .then(resolve)
            .catch(reject);
        })
        .catch(reject);
    });
  }
}

module.exports = Aggregator;
