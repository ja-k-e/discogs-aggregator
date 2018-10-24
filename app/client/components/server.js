Vue.component("server", {
  props: {
    usernames: Array
  },
  computed: {
    sortedMessages() {
      return Array.from(this.messages).reverse();
    }
  },
  data() {
    return {
      populating: false,
      messages: []
    };
  },
  methods: {
    populate() {
      this.populating = true;
      var evtSource = new EventSource("/api/populate");

      evtSource.onmessage = e => this.messages.push(e.data);

      evtSource.onerror = e => {
        this.populating = false;
        console.error(e);
      };
      evtSource.onend = () => {
        this.populating = false;
        console.log("EventSource terminated.");
      };
      console.log(evtSource);
    }
  },
  template: serverTemplate()
});

function serverTemplate() {
  return /*html*/ `
  <div>
    <p>Usernames: {{ usernames.join(' &bull; ') }}</p>
    <p><button @click="populate()" class="button is-info" :disabled="populating">Run populate()</button></p>

    <div>
      <p v-for="message in sortedMessages">{{ message }}</p>
    </div>
  </div>
  `;
}
