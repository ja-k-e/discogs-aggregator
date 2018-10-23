Vue.component("release", {
  props: {
    release: Object,
    releases: Array
  },
  data() {
    return {};
  },
  methods: {
    releaseLink(releaseId) {
      return `/release/${releaseId}`;
    }
  },
  template: `
  <div>
    <p class="title is-3">{{ release.title }}</p>
    <p class="subtitle is-5">
      {{ release.artists.map(a => a.name).join(' &bull; ') }} ({{ release.year }})
      <br> {{ release.formats.map(a => a.description +' ('+a.quantity+')').join(' &bull; ') }}
      <br> {{ release.labels.map(l => l.name).join(' &bull; ') }}
      <br>
      <em>In {{ release.collection_count }} Collections</em>
    </p>
    <h2 class="title is-4">Most-collected with "{{ release.title }}"</h2>

    <table class="table is-narrow is-fullwidth is-striped">
      <thead>
        <th><small>Shared</small></th>
        <th><small>Release</small></th>
        <th><small>Artists</small></th>
        <th><small>Labels</small></th>
      </thead>
      <tbody>
        <tr v-for="r in releases">
          <td>
            <small>{{ r.collection_count }} ({{ Math.round(r.collection_count / release.collection_count * 100) }}%)</small>
          </td>
          <td>
            <small>
              <a :href="releaseLink(r.release_id)" target="blank">{{ r.title }} ({{ r.year }})</a>
            </small>
          </td>
          <td>
            <span v-for="artist, i in r.artists">
              <span v-if="i !== 0">&nbsp;&bull;</span>
              <small>
                {{ artist.name.replace(/ /g, '&nbsp;') }}
              </small>
            </span>
          </td>
          <td>
            <span v-for="label, i in r.labels">
              <span v-if="i !== 0">&nbsp;&bull;</span>
              <small>
                {{ label.name.replace(/ /g, '&nbsp;') }}
              </small>
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  `
});
