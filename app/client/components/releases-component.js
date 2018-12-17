Vue.component("releases-component", {
  props: {
    releases: Array,
    collection_count: Number
  },
  computed: {
    sortedReleases() {
      return this.releases.sort((a, b) => {
        let [valA, valB] = this.sortVals(a, b);
        if (valA > valB) return this.sortOrder;
        if (valA < valB) return -1 * this.sortOrder;
        return 0;
      });
    }
  },
  data() {
    return {
      sortType: "count",
      sortOrder: -1
    };
  },
  methods: {
    sort($event, type, def = 1) {
      $event.preventDefault();
      if (this.sortType === type) this.sortOrder *= -1;
      else {
        this.sortType = type;
        this.sortOrder = def;
      }
    },
    sortVals(a, b) {
      if (this.sortType === "count")
        return [a.collection_count, b.collection_count];
      if (this.sortType === "title")
        return [`${a.title} ${a.year}`, `${b.title} ${b.year}`];
      if (this.sortType === "artist")
        return [
          a.artists.map(x => x.name).join(" "),
          b.artists.map(x => x.name).join(" ")
        ];
      if (this.sortType === "label")
        return [
          a.labels.map(x => x.name).join(" "),
          b.labels.map(x => x.name).join(" ")
        ];
    }
  },
  template: releaseTemplate()
});

function releaseTemplate() {
  return /*html*/ `
    <table class="table is-narrow is-fullwidth is-striped">
      <thead>
        <th><small><a href="#" @click="sort($event, 'count', -1)">
          #
          <span v-if="sortType === 'count'">
            <span v-if="sortOrder === 1">▼</span><span v-else>▲</span>
          </span>
        </a></small></th>
        <th><small><a href="#" @click="sort($event, 'title')">
          Release
          <span v-if="sortType === 'title'">
            <span v-if="sortOrder === 1">▼</span><span v-else>▲</span>
          </span>
        </a></small></th>
        <th><small><a href="#" @click="sort($event, 'artist')">
          Artists
          <span v-if="sortType === 'artist'">
            <span v-if="sortOrder === 1">▼</span><span v-else>▲</span>
          </span>
        </a></small></th>
        <th><small><a href="#" @click="sort($event, 'label')">
          Labels
          <span v-if="sortType === 'label'">
            <span v-if="sortOrder === 1">▼</span><span v-else>▲</span>
          </span>
        </a></small></th>
        <th><small>Formats</small></th>
      </thead>
      <tbody>
        <release-component v-for="r in sortedReleases"
          :key="r.id"
          :release="r"
          :collection_count="collection_count"
        ></release-component>
      </tbody>
    </table>
  `;
}
