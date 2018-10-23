Vue.component("release-release", {
  methods: {
    artistLink(artistId) {
      return `/artist/${artistId}`;
    },
    formatName(name) {
      return name.replace(/ /g, "&nbsp;");
    },
    releaseLink(releaseId) {
      return `/release/${releaseId}`;
    }
  },
  props: {
    release: Object,
    collection_count: Number
  },
  template: `
  <tr>
    <td>
      <small>{{ release.collection_count }} ({{ Math.round(release.collection_count / collection_count * 100) }}%)</small>
    </td>
    <td>
      <small><a :href="releaseLink(release.release_id)" target="blank">{{ release.title }} ({{ release.year }})</a></small>
    </td>
    <td>
      <span v-for="artist, i in release.artists">
        <span v-if="i !== 0">&nbsp;&bull;</span>
        <a :href="artistLink(artist.id)"><small v-html="formatName(artist.name)"></small></a>
      </span>
    </td>
    <td>
      <span v-for="label, i in release.labels">
        <span v-if="i !== 0">&nbsp;&bull;</span>
        <small v-html="formatName(label.name)"></small>
      </span>
    </td>
  </tr>
  `
});
