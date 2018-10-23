Vue.component("release", {
  props: {
    release: Object,
    releases: Array
  },
  computed: {
    formattedArtists() {
      return this.release.artists
        .map(artist => {
          return `<a href="/artist/${artist.id}">${artist.name}</a>`;
        })
        .join(" &bull; ");
    }
  },
  methods: {
    formatFormat({ name, quantity, description, text }) {
      let str = `${name}`;
      if (text) str += `, ${text}`;
      if (description) str += `, ${description}`;
      if (quantity !== 1) str += ` (${quantity})`;
      return str;
    }
  },
  template: `
  <div>
    <p class="title is-3">{{ release.title }}</p>
    <p class="subtitle is-5">
      <span v-html="formattedArtists"></span> ({{ release.year }})
      <br> {{ release.formats.map(formatFormat).join(' &bull; ') }}
      <br> {{ release.labels.map(l => l.name).join(' &bull; ') }}
      <br>
      Collections: <strong>{{ release.collection_count }}</strong>
    </p>
    <br>

    <h2 class="title is-5">Releases often-collected with "{{ release.title }}"</h2>

    <table class="table is-narrow is-fullwidth is-striped">
      <thead>
        <th><small>Shared Collections</small></th>
        <th><small>Release</small></th>
        <th><small>Artists</small></th>
        <th><small>Labels</small></th>
      </thead>
      <tbody>
        <release-release v-for="r in releases"
          :key="r.id"
          :release="r"
          :collection_count="release.collection_count"
        ></release-release>
      </tbody>
    </table>
  </div>
  `
});
