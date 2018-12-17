Vue.component("browser-page", {
  props: {
    index: Array
  },
  data() {
    return {
      phrase: null,
      type: "collection",
      searchResults: []
    };
  },
  methods: {
    search() {
      if (this.phrase) {
        const params = {
          term: encodeURIComponent(this.phrase),
          type: this.type
        };
        axios
          .get("/api/search", { params })
          .then(res => this.updateResults(res.data));
      } else this.updateResults([]);
    },
    href({ id, type }) {
      if (type === "collection") return this.collectionLink(id);
      if (type === "artist") return this.artistLink(id);
      if (type === "label") return this.labelLink(id);
      if (type === "release") return this.releaseLink(id);
    },
    artistLink(artistId) {
      return `/artist/${artistId}`;
    },
    collectionLink(collectionId) {
      return `/collection/${collectionId}`;
    },
    labelLink(labelId) {
      return `/label/${labelId}`;
    },
    releaseLink(releaseId) {
      return `/release/${releaseId}`;
    },
    updateResults(results) {
      this.searchResults.splice(0, this.searchResults.length);
      results = results.splice(0, 15);
      this.searchResults.push(...results);
    },
    updateType($event, type) {
      $event.preventDefault();
      this.type = type;
      this.search();
    }
  },
  template: browserTemplate()
});

function browserTemplate() {
  return /* html */ `
  <div>
    <h2 class="title is-5">Search</h2>
    {{ index }}
    <div class="tabs is-toggle is-small is-toggle-rounded">
      <ul>
        <li :class="{ 'is-active': type === 'collection' }">
          <a href="#" @click="updateType($event, 'collection')"><span>Collection</span></a>
        </li>
        <li :class="{ 'is-active': type === 'artist' }">
          <a href="#" @click="updateType($event, 'artist')"><span>Artist</span></a>
        </li>
        <li :class="{ 'is-active': type === 'label' }">
          <a href="#" @click="updateType($event, 'label')"><span>Label</span></a>
        </li>
        <li :class="{ 'is-active': type === 'release' }">
          <a href="#" @click="updateType($event, 'release')"><span>Release</span></a>
        </li>
      </ul>
    </div>

    <div class="search-component">
      <div class="field">
        <div class="control">
          <input type="search" v-model="phrase" @input="search()" @focus="search()" class="input" />
        </div>
      </div>
      <div class="results">
        <a v-for="result in searchResults" :href="href(result)"
          :class="{
            'has-text-primary': result.type === 'artist',
            'has-text-warning': result.type === 'collection',
            'has-text-danger': result.type === 'label',
          }">
          {{ result.name }} <span>{{ result.type }}</span>
        </a>
      </div>
    </div>
  </div>
  `;
}
