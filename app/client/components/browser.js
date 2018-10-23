Vue.component("browser", {
  props: {
    collections: Array,
    artists: Array,
    labels: Array,
    releases: Array,
    index: Array
  },
  data() {
    return {
      collection: this.collections[0].id,
      artist: this.artists[0].id,
      label: this.labels[0].id,
      sort: "release-asc",
      message: `Releases for Collection "${this.collections[0].id}"`,
      phrase: null,
      searchResults: []
    };
  },
  methods: {
    search() {
      if (this.phrase) {
        const options = {
          shouldSort: true,
          threshold: 0.1,
          location: 0,
          distance: 100,
          maxPatternLength: 32,
          minMatchCharLength: 2,
          keys: ["name"]
        };
        const fuse = new Fuse(this.index, options);
        const result = fuse.search(this.phrase);
        this.updateResults(result);
      } else this.updateResults([]);
    },
    artistLink(artistId) {
      return `/artist/${artistId}`;
    },
    releaseLink(releaseId) {
      return `/release/${releaseId}`;
    },
    loadResult({ id, type, name }) {
      if (type === "artist") this.onArtistChange(parseInt(id));
      else if (type === "label") this.onLabelChange(parseInt(id));
      else if (type === "collection") this.onCollectionChange(id);
      this.phrase = name;
      this.updateResults([]);
    },
    sortedByName(items) {
      return items;
      if (!items.sort) return items;
      return items.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase());
    },
    sortByCollectionCount() {
      let type =
        this.sort === "collection-desc" ? "collection-asc" : "collection-desc";
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
      let artist = this.artists.filter(({ id }) => id === this.artist)[0];
      this.message = `Releases for Artist "${artist.name}"`;
      axios
        .get("/api/artist-releases", { params })
        .then(res => this.updateReleases(res.data));
    },
    onCollectionChange(id = null) {
      if (id) this.collection = id;
      let params = { collectionId: this.collection };
      this.message = `Releases for Collection "${this.collection}"`;
      axios
        .get("/api/collection-releases", { params })
        .then(res => this.updateReleases(res.data));
    },
    onLabelChange(id = null) {
      if (id) this.label = id;
      let label = this.labels.filter(({ id }) => id === this.label)[0];
      this.message = `Releases for Label "${label.name}"`;
      let params = { labelId: this.label };
      axios
        .get("/api/label-releases", { params })
        .then(res => this.updateReleases(res.data));
    },
    updateReleases(releases) {
      this.releases.splice(0, this.releases.length);
      this.releases.push(...releases);
      this.sort = "release-asc";
    },
    updateResults(results) {
      this.searchResults.splice(0, this.searchResults.length);
      results = results.splice(0, 15);
      this.searchResults.push(...results);
    }
  },
  template: `
  <div>
    <h2 class="title is-5">Search for a User, Artist, or Label</h2>

    <div class="search-component">
      <div class="field">
        <div class="control">
          <input type="search" v-model="phrase" @input="search()" @focus="search()" class="input" />
        </div>
      </div>
      <div class="results">
        <a v-for="result in searchResults" @click="loadResult(result)"
          :class="{
            'has-text-primary': result.type === 'artist',
            'has-text-warning': result.type === 'collection',
            'has-text-danger': result.type === 'label',
          }">
          {{ result.name }} <span>{{ result.type }}</span>
        </a>
      </div>
    </div>

    <br>
    <h2 class="title is-5">{{ message }}</h2>
    <p class="subtitle is-6">"#" Denotes how many times the release occurs in <em>all</em> Collections.</p>


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
        <th>Artists</th>
        <th>Labels</th>
      </thead>
      <tbody>
        <tr v-for="release in releases">
          <td><small>{{ release.collection_count }}</small></td>
          <td><small><a :href="releaseLink(release.id)" target="blank">
            {{ release.title }}
            <span v-if="release.year !== 0">({{ release.year }})</span>
            <sup>↗</sup></a>
          </small></td>
          <td>
            <span v-for="artist, i in sortedByName(release.artists)">
              <span v-if="i !== 0">&nbsp;&bull;</span>
              <small><a :href="artistLink(artist.id)" target="blank">{{ artist.name.replace(/ /g, '&nbsp;') }} <sup>↗</sup></a></small>
            </span>
          </td>
          <td>
            <span v-for="label, i in sortedByName(release.labels)">
              <span v-if="i !== 0">&nbsp;&bull;</span>
              <small><a @click="onLabelChange(label.id)">{{ label.name.replace(/ /g, '&nbsp;') }}</a></small>
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  `
});
