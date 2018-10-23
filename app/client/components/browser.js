Vue.component("browser", {
  props: {
    collections: Array,
    artists: Array,
    labels: Array,
    releases: Array
  },
  data() {
    return {
      collection: this.collections[0].id,
      artist: this.artists[0].id,
      label: this.labels[0].id,
      sort: "release-asc",
      message: `Releases for Collection "${this.collections[0].id}"`
    };
  },
  methods: {
    releaseLink(releaseId) {
      return `/release/${releaseId}`;
    },
    sortedByName(items) {
      return items;
      if (!items.sort) return items;
      return items.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase());
    },
    sortByCollectionCount() {
      let type =
        this.sort === "collection-asc" ? "collection-desc" : "collection-asc";
      this.sort = type;
      this.releases = this.releases.sort((a, b) => {
        if (parseInt(a.collection_count) > parseInt(b.collection_count))
          return type === "collection-desc" ? -1 : 1;
        if (parseInt(a.collection_count) < parseInt(b.collection_count))
          return type === "collection-desc" ? 1 : -1;
        if (a.title > b.title) return 1;
        if (a.title < b.title) return -1;
        if (a.year > b.year) return 1;
        if (a.year < b.year) return -1;
        return 0;
      });
    },
    sortByReleaseTitle() {
      let type = this.sort === "release-asc" ? "release-desc" : "release-asc";
      this.sort = type;
      this.releases = this.releases.sort((a, b) => {
        if (a.title.toLowerCase() > b.title.toLowerCase())
          return type === "release-desc" ? -1 : 1;
        if (a.title.toLowerCase() < b.title.toLowerCase())
          return type === "release-desc" ? 1 : -1;
        if (a.year > b.year) return 1;
        if (a.year < b.year) return -1;
        return 0;
      });
    },
    onArtistChange(id = null) {
      if (id) this.artist = id;
      let params = { artistId: this.artist };
      let artist = this.artists.filter(({ id, name }) => id === this.artist)[0];
      this.message = `Releases for Artist "${artist.name}"`;
      axios
        .get("/api/artist-releases", { params })
        .then(res => this.updateReleases(res.data));
    },
    onCollectionChange() {
      let params = { collectionId: this.collection };
      this.message = `Releases for Collection "${this.collection}"`;
      axios
        .get("/api/collection-releases", { params })
        .then(res => this.updateReleases(res.data));
    },
    onLabelChange(id = null) {
      if (id) this.label = id;
      let label = this.labels.filter(({ id, name }) => id === this.label)[0];
      this.message = `Releases for Label "${label.name}"`;
      let params = { labelId: this.label };
      axios
        .get("/api/label-releases", { params })
        .then(res => this.updateReleases(res.data));
    },
    updateReleases(releases) {
      this.releases.splice(0, this.releases.length);
      this.releases.push(...releases);
    }
  },
  template: `
  <div>
    <div class="field has-addons">
      <div class="control">
        <span class="select">
          <select v-model="artist" @change="onArtistChange()">
            <option v-for="artist in artists" :value="artist.id">{{ artist.name }}</option>
          </select>
        </span>
      </div>
      <div class="control">
        <a class="button is-info" @click="onArtistChange()">Artist</a>
      </div>
    </div>

    <div class="field has-addons">
      <div class="control">
        <span class="select">
          <select v-model="label" @change="onLabelChange()">
            <option v-for="label in labels" :value="label.id">{{ label.name }}</option>
          </select>
        </span>
      </div>
      <div class="control">
        <a class="button is-info" @click="onLabelChange()">Label</a>
      </div>
    </div>

    <div class="field has-addons">
      <div class="control">
        <span class="select">
          <select v-model="collection" @change="onCollectionChange()">
            <option v-for="collection in collections" :value="collection.id">
              {{ collection.id }} ({{ collection.size }})
            </option>
          </select>
        </span>
      </div>
      <div class="control">
        <a class="button is-info" @click="onCollectionChange()">Collection</a>
      </div>
    </div>

    <h2 class="title is-5">{{ message }}</h2>

    <table class="table is-narrow is-fullwidth is-striped">
      <thead>
        <th>
          <small>
            <a @click="sortByCollectionCount">
              <span v-if="sort === 'collection-asc'">#&nbsp;▴</span>
              <span v-else-if="sort === 'collection-desc'">#&nbsp;▾</span>
              <span v-else>#</span>
            </a>
          </small>
        </th>
        <th>
          <a @click="sortByReleaseTitle">
            <span v-if="sort === 'release-asc'">Release&nbsp;▴</span>
            <span v-else-if="sort === 'release-desc'">Release&nbsp;▾</span>
            <span v-else>Release</span>
          </a>
        </th>
        <th>Year</th>
        <th>Artists</th>
        <th>Labels</th>
      </thead>
      <tbody>
        <tr v-for="release in releases">
          <td>
            <small>{{ release.collection_count }}</small>
          </td>
          <td>
            <small>
              <a :href="releaseLink(release.id)" target="blank">{{ release.title }} ↗</a>
            </small>
          </td>
          <td>
            <small>{{ release.year }}</small>
          </td>
          <td>
            <span v-for="artist, i in sortedByName(release.artists)">
              <span v-if="i !== 0">&nbsp;&bull;</span>
              <small>
                <a @click="onArtistChange(artist.id)">{{ artist.name.replace(/ /g, '&nbsp;') }}</a>
              </small>
            </span>
          </td>
          <td>
            <span v-for="label, i in sortedByName(release.labels)">
              <span v-if="i !== 0">&nbsp;&bull;</span>
              <small>
                <a @click="onLabelChange(label.id)">{{ label.name.replace(/ /g, '&nbsp;') }}</a>
              </small>
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  `
});
