Vue.component("server-page", {
  props: {
    collections: Array
  },
  computed: {
    availableCollections() {
      return Array.from(this.collections).filter(
        ({ id }) => this.queue[id] === undefined
      );
    },
    availableQueue() {
      return Object.keys(this.queue)
        .reverse()
        .map(id => ({ id }));
    },
    dump() {
      if (!this.dumpRaw) return [];
      return this.dumpRaw.replace(/ /g, "").split("\n");
    },
    sortedMessages() {
      return Array.from(this.messages).reverse();
    }
  },
  data() {
    return {
      populating: false,
      messages: [],
      queue: {},
      dumpRaw: "",
      error: null
    };
  },
  methods: {
    addDumpToQueue() {
      this.dump.forEach(id => this.addToQueue(id));
    },
    addToQueue(id) {
      this.$set(this.queue, id, true);
    },
    clearQueue() {
      this.queue = {};
    },
    removeFromQueue(id) {
      this.$delete(this.queue, id);
    },
    parseAnsi(ansi) {
      return ansi
        .replace(/\[39m|\[49m|\[22m/g, "</span>")
        .replace(/\[(\d+?)m/g, '<span class="ansi-$1">');
    },
    populate() {
      this.populating = true;
      this.messages = [];
      let ids = Object.keys(this.queue)
        .map(id => encodeURIComponent(id))
        .join(",");
      window.onbeforeunload = e => {
        e.preventDefault();
        e.returnValue = "";
      };
      const source = new EventSource(`/api/populate?ids=${ids}`);

      source.onmessage = ({ data }) => {
        let { payload, type } = JSON.parse(data);
        this.messages.push(payload);
        let $el = this.$el;
        setTimeout(() => {
          let messages = $el.querySelector("#console-messages");
          messages.scrollTop = messages.scrollHeight;
        }, 50);
        if (type === "complete") {
          this.populating = false;
          source.close();
          this.clearQueue();
          window.onbeforeunload = null;
        } else if (type === "error") {
          this.populating = false;
          source.close();
          this.clearQueue();
          window.onbeforeunload = null;
          this.error = payload;
          console.error(payload);
        } else console.log(payload);
      };

      source.onerror = endHandler;
      source.onend = endHandler;

      function endHandler({ data }) {
        this.populating = false;
        source.close();
        window.onbeforeunload = null;
        let { payload } = JSON.parse(data);
        console.log("ERROR", payload);
      }
    }
  },
  template: serverTemplate()
});

function serverTemplate() {
  return /*html*/ `
  <div>
    <h1 class="title is-3">Fetch Data from Discogs.</h1>
    <p class="subtitle is-5">Queue collections from the database or paste in newline-separated queue then run below.</p>

    <div class="notification is-danger" v-if="error">
      <button class="delete" @click="error = null"></button>
      {{ error }}
    </div>

    <div class="columns">
      <div class="column is-one-half">
        <h2 class="title is-5">Queued for Fetching ({{ availableQueue.length }})</h2>
        <div class="overflow-panel">
          <nav class="panel">
            <label class="panel-block" v-if="availableQueue.length === 0">
              <em>Add some Collections!</em>
            </label>
            <a class="panel-block" v-for="{ id } in availableQueue"
              @click="removeFromQueue(id)"
            ><span class="panel-icon"><a class="delete is-small"></a></span>
              {{ id }}
            </a>
          </nav>
        </div>
        <br>
        <button class="button is-fullwidth is-danger" @click="clearQueue()" :disabled="availableQueue.length === 0">
          <a class="delete is-small"></a>&nbsp; Clear All
        </button>
        <br>
        <button @click="populate()" class="button is-success is-fullwidth" :disabled="populating || availableQueue.length === 0">
          Import {{ availableQueue.length }} Discogs Collection(s)
        </button>
      </div>
      <div class="column is-one-half">
        <h2 class="title is-5">Usernames, new line separated  ({{ dump.length }})</h2>
        <textarea class="textarea" rows="11" v-model="dumpRaw"></textarea>
        <br>
        <button class="button is-info is-fullwidth" @click="addDumpToQueue()" :disabled="dump.length === 0">
          <a class="delete plus is-small"></a>&nbsp; Add
        </button>
      </div>
    </div>

    <div class="modal" :class="{ 'is-active': populating }">
      <div class="modal-background"></div>
      <div class="modal-content">
        <div class="box">
          <h2 class="title is-4">Don't close while this is running</h2>
          <h2 class="subtitle is-6">This modal will close when complete.</h2>
          <div id="console-messages">
            <span class="console-message" v-html="parseAnsi(message)" v-for="message in messages"></span>
            <span class="console-message" v-if="messages.length === 0"><em>Waiting...</em></span>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
}
