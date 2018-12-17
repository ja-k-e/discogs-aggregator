Vue.component("release-component", {
  computed: {
    percentage() {
      if (!this.collection_count) return "";
      return `(${Math.round(
        (this.release.collection_count / this.collection_count) * 100
      )}%)`;
    }
  },
  methods: {
    formatName(name) {
      return name.replace(/ /g, "&nbsp;");
    },
    formatRelease({ id, title, year }) {
      return `<a href="/release/${id}">${title} ${
        year === 0 ? "" : `(${year})`
      }</a>`;
    },
    formatArtists(artists) {
      return artists
        .map(a => `<a href="/artist/${a.id}">${a.name}</a>`)
        .join(" &bull; ");
    },
    formatLabels(labels) {
      return labels
        .map(a => `<a href="/label/${a.id}">${a.name}</a>`)
        .join(" &bull; ");
    },
    formatFormat({ name, quantity, description, text }) {
      let str = `${name}`;
      if (text) str += `, ${text}`;
      if (description) str += `, ${description}`;
      if (quantity !== 1) str += ` (${quantity})`;
      return str;
    },
    formatFormats(formats) {
      return formats.map(this.formatFormat).join(" &bull; ");
    }
  },
  props: {
    release: Object,
    collection_count: Number
  },
  template: /* html */ `
  <tr>
    <td><small>{{ release.collection_count }} {{ percentage }}</small></td>
    <td><small v-html="formatRelease(release)"></small></td>
    <td><small v-html="formatArtists(release.artists)"></small></td>
    <td><small v-html="formatLabels(release.labels)"></small></td>
    <td><small v-html="formatFormats(release.formats)"></small></td>
  </tr>
  `
});
