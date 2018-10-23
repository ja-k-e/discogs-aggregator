Vue.component("artist", {
  props: {
    artist: Object,
    artists: Array
  },
  computed: {
    sortedReleases() {
      return this.artist.releases.sort((a, b) => {
        if (a.title < b.title) return -1;
        if (a.title > b.title) return 1;
        if (a.year < b.year) return -1;
        if (a.year > b.year) return 1;
        return 0;
      });
    }
  },
  methods: {
    artistLink(artistId) {
      return `/artist/${artistId}`;
    },
    formattedReleases(releases) {
      return releases
        .map(({ id, title, year, collection_count }) => {
          return `<a href="/release/${id}">${title} (${year}) ${collection_count}</a>`;
        })
        .join(" &bull; ");
    }
  },
  template: `
  <div>
    <p class="title is-3">{{ artist.name }}</p>
    <p class="subtitle is-5">
      Releases: <strong>{{ artist.release_count }}</strong>
      <br>
      Collected: <strong>{{ artist.collected_count }}</strong>
      <br>
      Collections: <strong>{{ artist.collection_count }}</strong>
    </p>
    <br>
    <h2 class="title is-4">Releases</h2>

    <p v-html="formattedReleases(this.sortedReleases)"></p>
    <br>

    <h2 class="title is-4">Most-collected with "{{ artist.name }}"</h2>

    <table class="table is-narrow is-fullwidth is-striped">
      <thead>
        <th><small>Shared</small></th>
        <th><small>Artist</small></th>
      </thead>
      <tbody>
        <tr v-for="a in artists">
          <td>
            <small>{{ a.collection_count }} ({{ Math.round(a.collection_count / artist.collection_count * 100) }}%)</small>
          </td>
          <td>
            <small><a :href="artistLink(a.artist_id)" target="blank">{{ a.name }}</a></small>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  `
});
