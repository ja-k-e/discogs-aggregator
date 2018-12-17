Vue.component("label-page", {
  props: {
    label: Object,
    releases: Array
  },
  computed: {},
  data() {
    return {};
  },
  template: labelTemplate()
});

function labelTemplate() {
  return /*html*/ `
  <div>
    <p class="title is-3">{{ label.name }}</p>
    <p class="subtitle is-5">
      Releases: <strong>{{ releases.length }}</strong>
    </p>

    <releases-component :releases="releases"></releases-component>
  </div>
  `;
}
