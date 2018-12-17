require("colors");
const Database = require("./Database");
const Discogs = require("disconnect").Client;
const fs = require("fs");
const settings = JSON.parse(fs.readFileSync("secrets.json").toString());
const PER_PAGE = 100;
const PAGE_LIMIT = 20;

class Collection {
  constructor(username, messenger) {
    this.messenger = messenger;
    this.username = username;
    this.api = new Discogs(settings.discogs).user().collection();
    // How long to push the request back in seconds if we hit a rate limit.
    this.pushback = settings.discogs.userToken ? 20 : 45;
    this.collection = null; // Populated by #prepare
    this.data = {
      collection: { username, size: 0 },
      artists: {},
      labels: {},
      releases: {},
      artistReleases: [],
      labelReleases: [],
      collectionReleases: []
    };
  }

  prepare() {
    return new Promise((resolve, reject) => {
      new Database()
        .findCollection(this.username)
        .then(res => {
          this.collection = res.rows[0];
          resolve();
        })
        .catch(reject);
    });
  }

  run() {
    return new Promise((resolve, reject) => {
      // Checking the collection size to determine if it is worth getting.
      if (this.collection) {
        this.api
          .getFolder(this.username, 0)
          .then(({ count }) => {
            if (count !== this.collection.size) resolve(this._run());
            else {
              this.data.collection.size = count;
              this.messenger(`✔ No updates!`.green);
              resolve(this.data);
            }
          })
          .catch(({ statusCode, message }) => {
            let rateLimited =
              statusCode === 429 &&
              message === "You are making requests too quickly.";
            if (rateLimited) {
              // Try again later
              this.messenger(
                `❗ Rate Limited. Pushing Back ${this.pushback}s.`.red
              );
              setTimeout(() => resolve(this.run()), this.pushback * 1000);
            } else if (
              message ===
              "You are not allowed to view this resource. Please authenticate as the owner to view this content."
            ) {
              this.messenger(`Private Collection!`.red);
              resolve(this.data);
            } else reject({ statusCode, message });
          });
      } else resolve(this._run());
    });
  }

  // Get all the releases in a user's collection and return the releases and artists.
  _run(collection = [], page = 1) {
    return new Promise((resolve, reject) => {
      let settings = { page, per_page: PER_PAGE };
      this.api
        .getReleases(this.username, 0, settings)
        .then(({ pagination, releases }) => {
          collection = collection.concat(
            releases.map(this._formatRelease.bind(this))
          );
          this.messenger(`➡ Page ${page} of ${pagination.pages}`.blue);
          this.data.collection.size = pagination.items;
          if (pagination.pages === page || page >= PAGE_LIMIT) {
            this._processCollection(collection);
            resolve(this.data);
          } else resolve(this._run(collection, page + 1));
        })
        .catch(({ statusCode, message }) => {
          let rateLimited =
            statusCode === 429 &&
            message === "You are making requests too quickly.";
          if (rateLimited) {
            // Try again later
            this.messenger(
              `❗ Rate Limited. Pushing Back ${this.pushback}s.`.red
            );
            setTimeout(
              () => resolve(this._run(collection, page)),
              this.pushback * 1000
            );
          } else if (
            message ===
            "You are not allowed to view this resource. Please authenticate as the owner to view this content."
          ) {
            this.messenger(`Private Collection!`.red);
            resolve(this.data);
          } else reject({ statusCode, message });
        });
    });
  }

  _formatRelease({ basic_information }) {
    let { id, title, year, artists, labels, formats } = basic_information;
    return {
      id,
      title,
      year,
      artists: artists.map(a => [a.id, a.name]),
      labels: labels.map(l => [l.id, l.name]),
      formats: formats.map(f => {
        return {
          description: f.descriptions ? f.descriptions.join(", ") : null,
          name: f.name,
          quantity: f.qty ? parseInt(f.qty) : 1,
          text: f.text
        };
      })
    };
  }

  _processCollection(rawReleases) {
    rawReleases.forEach(release => {
      // Add to the collectionReleases
      this.data.collectionReleases.push([this.username, release.id]);
      release.artists.forEach(([id, name]) => {
        // Add to artists
        this.data.artists[id] = [id, name];
        // Add to artistReleases
        this.data.artistReleases.push([id, release.id]);
      });
      release.labels.forEach(([id, name]) => {
        // Add to labels
        this.data.labels[id] = [id, name];
        // Add to labelReleases
        this.data.labelReleases.push([id, release.id]);
      });
      // Add to releases
      this.data.releases[release.id] = [
        release.id,
        release.title,
        release.year,
        release.formats
      ];
    });
    this.data.artists = Object.values(this.data.artists);
    this.data.labels = Object.values(this.data.labels);
    this.data.releases = Object.values(this.data.releases);
  }
}

module.exports = Collection;
