Vue.component("artist-page", {
  props: {
    artist: Object,
    artists: Array,
    full: Object
  },
  data() {
    return {
      activeTab: "common"
    };
  },
  methods: {
    artistLink(artistId) {
      return `/artist/${artistId}`;
    }
  },
  template: artistTemplate()
});

function artistTemplate() {
  return /* html */ `
  <div>
    <p class="title is-3">{{ artist.name }}</p>
    <p class="subtitle is-5">
      Collected: <strong>{{ artist.collected_count }}</strong>
      <br>
      Collections: <strong>{{ artist.collection_count }}</strong>
    </p>

    <div class="tabs">
      <ul>
        <li :class="{ 'is-active': activeTab == 'common' }">
          <a @click="activeTab = 'common'">Similar Artists ({{ artists.length }})</a>
        </li>
        <li :class="{ 'is-active': activeTab == 'releases' }">
          <a @click="activeTab = 'releases'">Releases ({{ artist.release_count }})</a>
        </li>
        <li :class="{ 'is-active': activeTab == 'info' }">
          <a @click="activeTab = 'info'">Information</a>
        </li>
      </ul>
    </div>

    <div v-if="activeTab == 'info'">
      <h2 class="title is-5">Images</h2>
      <div class="images">
        <div>
          <img :src="image.resource_url" :height="image.height" :width="image.width" v-for="image in full.images">
        </div>
      </div>

      <br>
      <h2 class="title is-5">Profile</h2>
      <div class="content" v-html="'<p>' + full.profile.replace(/\\n/g, '</p><p>') + '</p>'"></div>
    </div>

    <div v-if="activeTab == 'releases'">
      <releases-component :releases="artist.releases"></releases-component>
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
  `;
}
