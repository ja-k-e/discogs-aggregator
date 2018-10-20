var app = new Vue({
  el: "#app",
  data() {
    return {
      collection: null,
      collections: null,
      artist: null,
      artists: null,
      label: null,
      labels: null,
      releases: null,
      sort: "release-asc",
      message: null
    };
  },
  methods: {
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
      axios.get("/artist", { params }).then(res => (this.releases = res.data));
    },
    onCollectionChange() {
      let params = { collectionId: this.collection };
      this.message = `Releases for Collection "${this.collection}"`;
      axios
        .get("/collection", { params })
        .then(res => (this.releases = res.data));
    },
    onLabelChange(id = null) {
      if (id) this.label = id;
      let label = this.labels.filter(({ id, name }) => id === this.label)[0];
      this.message = `Releases for Label "${label.name}"`;
      let params = { labelId: this.label };
      axios.get("/label", { params }).then(res => (this.releases = res.data));
    }
  },
  mounted() {
    axios.get("/all", { params: {} }).then(res => {
      this.collections = res.data.collections;
      this.artists = res.data.artists;
      this.labels = res.data.labels;
      this.collection = this.collections[0].id;
      this.label = this.labels[0].id;
      this.artist = this.artists[0].id;
      this.message = `Releases for Collection "${this.collection}"`;
      let params = { collectionId: this.collections[0].id };
      axios
        .get("/collection", { params })
        .then(res => (this.releases = res.data));
    });
  }
});
