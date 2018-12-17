Vue.component("release-page", {
  props: {
    release: Object,
    releases: Array,
    full: Object
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
      activeTab: "common"
    };
  },
  template: releaseTemplate()
});

function releaseTemplate() {
  return /*html*/ `
  <div>
    <p class="title is-3">{{ release.title }}</p>
    <p class="subtitle is-5">
      <span v-html="formattedArtists"></span> ({{ release.year }})
      <br>
      Collections: <strong>{{ release.collection_count }}</strong>
    </p>

    <div class="tabs">
      <ul>
        <li :class="{ 'is-active': activeTab == 'common' }">
          <a @click="activeTab = 'common'">Similar Releases ({{ releases.length }})</a>
        </li>
        <li :class="{ 'is-active': activeTab == 'info' }">
          <a @click="activeTab = 'info'">Information</a>
        </li>
      </ul>
    </div>

    <div v-if="activeTab == 'info'">
      <h2 class="title is-5">Labels</h2>
      <p class="subtitle is-5">
        <a v-for="label in release.labels" :href="'https://api.discogs.com/labels/'+label.id" target="blank">
          {{ label.name }}
        </a>
      </p>

      <br>
      <h2 class="title is-5">Images</h2>
      <div class="images">
        <div>
          <img :src="image.resource_url" :height="image.height" :width="image.width" v-for="image in full.images">
        </div>
      </div>

      <br>
      <div v-if="release.formats">
        <h2 class="title is-5">Release Formats</h2>
        <table class="table is-narrow is-fullwidth is-striped">
          <thead>
            <tr>
              <th><small>Name</small></th>
              <th><small>Description</small></th>
              <th><small>Quantity</small></th>
              <th><small>Extra</small></th>
            </tr>
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

      <br>
      <h2 class="title is-5">Tracks</h2>
      <table class="table is-narrow is-fullwidth is-striped">
        <thead>
          <tr>
            <th><small>Pos.</small></th>
            <th><small>Title</small></th>
          </tr>
        </thead>
        <tbody>
        <tr v-for="track in full.tracklist">
          <td>{{ track.position }}</td>
          <td>{{ track.title }}</td>
        </tr>
        </tbody>
      </table>
      <br>
      <h2 class="title is-5">Notes</h2>

      <div class="content" v-html="'<p>' + (full.notes || '').replace(/\\n/g, '</p><p>') + '</p>'"></div>
    </div>

    <div v-if="activeTab == 'common'">
      <releases-component :releases="releases" :collection_count="release.collection_count"></releases-component>
    </div>
  </div>
  `;
}
