Vue.component("collection-page", {
  props: {
    collection: Object,
    releases: Array
  },
  computed: {},
  data() {
    return {};
  },
  template: collectionTemplate()
});

function collectionTemplate() {
  return /*html*/ `
  <div>
    <p class="title is-3">{{ collection.id }}</p>
    <p class="subtitle is-5">
      Releases: <strong>{{ collection.size }}</strong>
    </p>

    <releases-component :releases="releases"></releases-component>
  </div>
  `;
}
