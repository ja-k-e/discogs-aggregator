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
      const source = new EventSource("/api/populate");

      source.onmessage = ({ data }) => {
        let { payload, type } = JSON.parse(data);
        let message = sanitizePayload(payload);
        if (type === "complete") {
          source.close();
          this.populating = false;
          console.log("DONE");
        } else console.log(payload);
        this.messages.push(message);
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
        let { payload, type } = JSON.parse(data);
        if (type === "complete") console.log("DONE");
        else console.log("ERROR", payload);
      }
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
      <pre>
{{ messages.join('\\n') }}
      </pre>
    </div>
  </div>
  `;
}
