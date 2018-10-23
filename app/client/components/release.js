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
  data() {
    return {
      activeTab: "meta"
    };
  },
  template: `
  <div>
    <p class="title is-3">{{ release.title }}</p>
    <p class="subtitle is-5">
      <span v-html="formattedArtists"></span> ({{ release.year }})
    </p>

    <div class="tabs">
      <ul>
        <li :class="{ 'is-active': activeTab == 'meta' }">
          <a @click="activeTab = 'meta'">Metadata</a>
        </li>
        <li :class="{ 'is-active': activeTab == 'common' }">
          <a @click="activeTab = 'common'">Releases Often Collected with "{{ release.title }}"</a>
        </li>
      </ul>
    </div>

    <div v-if="activeTab == 'meta'">
      <p class="subtitle is-5">
        Collections: <strong>{{ release.collection_count }}</strong>
        <br>
        Labels: {{ release.labels.map(l => l.name).join(', ') }}
      </p>

      <div v-if="release.formats">
        <h2 class="title is-5">Release Formats</h2>
        <table class="table is-narrow is-fullwidth is-striped">
          <thead>
            <th><small>Name</small></th>
            <th><small>Description</small></th>
            <th><small>Quantity</small></th>
            <th><small>Extra</small></th>
          </thead>
          <tbody>
            <tr v-for="f in release.formats">
              <td v-html="f.name"></td>
              <td v-html="f.description"></td>
              <td v-html="f.quantity"></td>
              <td v-html="f.text"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="activeTab == 'common'">
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
  </div>
  `
});
