Vue.component("artist", {
  props: {
    artist: Object,
    artists: Array
  },
  data() {
    return {
      activeTab: "releases"
    };
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
    formatRelease({ id, title, year }) {
      return `<a href="/release/${id}">${title} ${
        year === 0 ? "" : `(${year})`
      }</a>`;
    },
    formatArtists(artists) {
      return artists
        .filter(a => a.id !== this.artist.id)
        .map(a => `<a href="/artist/${a.id}">${a.name}</a>`)
        .join(" &bull; ");
    },
    formatLabels(labels) {
      return labels.map(a => a.name).join(" &bull; ");
    },
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
    <p class="title is-3">{{ artist.name }}</p>
    <p class="subtitle is-5">
      Collected: <strong>{{ artist.collected_count }}</strong>
      <br>
      Collections: <strong>{{ artist.collection_count }}</strong>
    </p>

    <div class="tabs">
      <ul>
        <li :class="{ 'is-active': activeTab == 'releases' }">
          <a @click="activeTab = 'releases'">Releases ({{ artist.release_count }})</a>
        </li>
        <li :class="{ 'is-active': activeTab == 'common' }">
          <a @click="activeTab = 'common'">Artists Often Collected with "{{ artist.name }}"</a>
        </li>
      </ul>
    </div>

    <div v-if="activeTab == 'releases'">
      <table class="table is-narrow is-fullwidth is-striped">
        <thead>
          <th><small>#</small></th>
          <th><small>Release</small></th>
          <th><small>Formats</small></th>
          <th><small>Labels</small></th>
          <th><small>Collab</small></th>
        </thead>
        <tbody>
          <tr v-for="r in sortedReleases">
            <td><small>{{ r.collection_count }}</small></td>
            <td><small v-html="formatRelease(r)"></small></td>
            <td><small>{{ r.formats.map(formatFormat).join('&bull;') }}</small></td>
            <td><small v-html="formatLabels(r.labels)"></small></td>
            <td><small v-html="formatArtists(r.artists)"></small></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="activeTab == 'common'">
      <table class="table is-narrow is-fullwidth is-striped">
        <thead>
          <th><small>Shared Collections</small></th>
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
  </div>
  `
});
