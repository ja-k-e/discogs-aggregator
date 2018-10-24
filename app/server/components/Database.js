const { Client } = require("pg");
const fs = require("fs");
const settings = JSON.parse(fs.readFileSync("secrets.json").toString());

class Database {
  async execute(sql) {
    const client = new Client(settings.database);
    await client.connect();
    const res = await client.query(sql);
    await client.end();
    return res;
  }

  findCollection(username) {
    return new Promise((resolve, reject) => {
      resolve(
        this.execute(`SELECT * FROM collections WHERE id = '${username}';`)
      );
    });
  }

  refreshMaterializedViews() {
    return this.execute(`
      REFRESH MATERIALIZED VIEW expanded_releases;
      REFRESH MATERIALIZED VIEW collection_artists;
    `);
  }

  upsertCollection(data) {
    return new Promise((resolve, reject) => {
      var sql;
      if (data.releases.length) sql = this._sqlFromCollection(data);
      else {
        const collection = this._formatCollection(data.collection);
        sql = `
        INSERT INTO collections (id, size)
        VALUES ${collection}
            ON CONFLICT (id) DO UPDATE SET size = EXCLUDED.size;`;
      }
      resolve(this.execute(sql));
    });
  }

  _sqlFromCollection(data) {
    const collection = this._formatCollection(data.collection);
    const artists = this._formatArtists(data.artists);
    const labels = this._formatLabels(data.labels);
    const releases = this._formatReleases(data.releases);
    const cReleases = this._formatCollectionReleases(data.collectionReleases);
    const aReleases = this._formatArtistReleases(data.artistReleases);
    const lReleases = this._formatLabelReleases(data.labelReleases);
    return `
      INSERT INTO collections (id, size)
      VALUES ${collection}
          ON CONFLICT (id) DO UPDATE SET size = EXCLUDED.size;

      INSERT INTO artists (id, name)
      VALUES ${artists}
          ON CONFLICT (id) DO NOTHING;

      INSERT INTO labels (id, name)
      VALUES ${labels}
          ON CONFLICT (id) DO NOTHING;

      INSERT INTO releases (id, title, year, formats)
      VALUES ${releases}
          ON CONFLICT (id) DO NOTHING;

      INSERT INTO collection_releases (collection_id, release_id)
      VALUES ${cReleases}
          ON CONFLICT (collection_id, release_id) DO NOTHING;

      INSERT INTO artist_releases (artist_id, release_id)
      VALUES ${aReleases}
          ON CONFLICT (artist_id, release_id) DO NOTHING;

      INSERT INTO label_releases (label_id, release_id)
      VALUES ${lReleases}
          ON CONFLICT (label_id, release_id) DO NOTHING;
    `;
  }

  _formatCollection({ username, size }) {
    return `('${username}',${size})`;
  }

  _formatArtists(artists) {
    return artists.map(a => `(${a[0]},'${this._esc(a[1])}')`).join(",");
  }

  _formatLabels(labels) {
    return labels.map(l => `(${l[0]},'${this._esc(l[1])}')`).join(",");
  }

  _formatReleases(releases) {
    return releases
      .map(r => {
        let format = this._esc(JSON.stringify(r[3]));
        return `(${r[0]},'${this._esc(r[1])}', '${r[2]}', '${format}')`;
      })
      .join(",");
  }

  _formatCollectionReleases(collectionReleases) {
    return collectionReleases.map(cr => `('${cr[0]}',${cr[1]})`);
  }

  _formatArtistReleases(artistReleases) {
    return artistReleases.map(cr => `(${cr[0]},${cr[1]})`);
  }

  _formatLabelReleases(labelReleases) {
    return labelReleases.map(cr => `(${cr[0]},${cr[1]})`);
  }

  _esc(str) {
    return str.replace(/'/g, "''");
  }
}

module.exports = Database;
