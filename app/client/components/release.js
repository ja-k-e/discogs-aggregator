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
  template: `
  <div>
    <p class="title is-3">{{ release.title }}</p>
    <p class="subtitle is-5">
      <span v-html="formattedArtists"></span> ({{ release.year }})
      <br> {{ release.formats.map(a => a.description +' ('+a.quantity+')').join(' &bull; ') }}
      <br> {{ release.labels.map(l => l.name).join(' &bull; ') }}
      <br>
      Collections: <strong>{{ release.collection_count }}</strong>
    </p>
    <br>

    <h2 class="title is-4">Most-collected with "{{ release.title }}"</h2>

    <table class="table is-narrow is-fullwidth is-striped">
      <thead>
        <th><small>Shared</small></th>
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
