const DATA = JSON.parse(
  decodeURIComponent(document.querySelector("#payload").value)
);
const { type, payload } = DATA;

new Vue({
  el: "#app",
  data() {
    return {
      currentView: null,
      payload: null
    };
  },
  mounted() {
    this.payload = payload;
    this.currentView = type;
  }
});
