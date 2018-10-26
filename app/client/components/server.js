Vue.component("server", {
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
    addAllToQueue() {
      this.availableCollections.forEach(({ id }) => {
        this.addToQueue(id);
      });
    },
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
        let message = sanitizePayload(payload);
        this.messages.push(message);
        let $el = this.$el;
        setTimeout(() => {
          let messages = $el.querySelector("#messages");
          messages.scrollTop = messages.scrollHeight;
        }, 50);
        if (type === "complete") {
          console.log("DONE");
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

      function sanitizePayload(payload) {
        if (!payload) return "";
        let regex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
        return payload.replace(regex, "");
      }

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
      <div class="column is-one-third">
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
      <div class="column is-one-third">
        <h2 class="title is-5">Collections in Database ({{ availableCollections.length }})</h2>
        <div class="overflow-panel">
          <nav class="panel">
            <label class="panel-block" v-if="availableCollections.length === 0">
              <em>None</em>
            </label>
            <a class="panel-block" v-for="{ id } in availableCollections"
              @click="addToQueue(id)"
            ><span class="panel-icon"><a class="delete plus is-small"></a></span>
              {{ id }}
            </a>
          </nav>
        </div>
        <br>
        <button class="button is-info is-fullwidth" @click="addAllToQueue()" :disabled="availableCollections.length === 0">
          <a class="delete plus is-small"></a>&nbsp; Add All
        </button>
      </div>
      <div class="column is-one-third">
        <h2 class="title is-5">Paste usernames, new line separated  ({{ dump.length }})</h2>
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
          <div id="messages" style="height: 50vh; overflow-y: auto">
            <p v-for="message in messages">{{ message }}</p>
            <p v-if="messages.length === 0"><em>Waiting...</em></p>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
}
