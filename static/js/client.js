// client/client.ts
var USER_NAME_STORAGE_ID = "sloppychat-username";
class Client {
  server;
  socket = null;
  reconnectInterval = 1000;
  reconnectHandle = null;
  userId = null;
  userName = null;
  state = 0 /* Disconnected */;
  constructor(server) {
    this.server = server;
    this.userName = localStorage.getItem(USER_NAME_STORAGE_ID) || null;
  }
  connect() {
    this._connect(false);
  }
  _connect(isReconnect = false) {
    this.socket = new WebSocket(this.server);
    this.state = isReconnect ? 4 /* Reconnecting */ : 3 /* Connecting */;
    this.socket.onopen = (ev) => {
      this.state = 1 /* Connected */;
      console.info("Server connection established.");
    };
    this.socket.onclose = (ev) => {
      if ((this.state === 1 /* Connected */ || this.state === 2 /* InSession */) && this.disconnectedCallback) {
        console.warn("Server connection lost.");
        this.disconnectedCallback();
      }
      this.state = 0 /* Disconnected */;
      if (this.reconnectHandle)
        clearTimeout(this.reconnectHandle);
      this.reconnectHandle = setTimeout(() => {
        this._connect(true);
      }, this.reconnectInterval);
    };
    this.socket.onerror = (error) => {
      error.preventDefault();
      if (this.state !== 4 /* Reconnecting */ && this.state !== 3 /* Connecting */)
        console.error("Connection error", error, this.state);
    };
    this.socket.onmessage = async (ev) => {
      const data = JSON.parse(ev.data);
      const type = data["type"];
      if (type === "ACK" /* ACK */) {
        const ack = data;
        console.debug("Recieved ACK message on connect with ID", ack.userId);
        this.userId = ack.userId;
        if (!this.userName) {
          this.userName = `slop-${this.userId.substring(0, 6)}`;
          localStorage.setItem(USER_NAME_STORAGE_ID, this.userName);
        }
        const sr = {
          type: "SRC" /* SESSION_CREATE */,
          userId: this.userId,
          desiredName: this.userName
        };
        this.socket.send(JSON.stringify(sr));
        return;
      }
      if (type === "SRP" /* SESSION_ACK */) {
        this.state = 2 /* InSession */;
        if (this.connectedCallback) {
          this.connectedCallback(this.userName);
        }
      }
      if (type === "RESP" /* MSG_RESPONSE */) {
        const msg = data;
        console.debug("Chat message recieved from.", msg.userName);
        if (this.messageCallback) {
          this.messageCallback(msg.userName, msg.message, msg.userType);
        }
        return;
      }
      if (type === "NACK" /* NAME_CHANGE_ACK */) {
        const res = data;
        if (res.success) {
          this.userName = res.newName;
          localStorage.setItem(USER_NAME_STORAGE_ID, this.userName);
        }
        if (this.nameChangeCallback) {
          this.nameChangeCallback(res.newName, res.success);
        }
      }
    };
  }
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.state = 0 /* Disconnected */;
    }
  }
  send(message) {
    if (this.state !== 2 /* InSession */ || !this.socket) {
      console.warn("Sending message without client session.");
      return false;
    }
    const pr = {
      type: "REQ" /* MSG_REQUEST */,
      userId: this.userId,
      message
    };
    this.socket.send(JSON.stringify(pr));
    return true;
  }
  changeName(newName) {
    if (this.state !== 2 /* InSession */ || !this.socket) {
      console.warn("Trying to change name without session.");
      return false;
    }
    if (newName?.length < 3) {
      console.warn("Name too short.");
      return false;
    }
    const nc = {
      type: "NAME" /* NAME_CHANGE */,
      userId: this.userId,
      newName
    };
    this.socket.send(JSON.stringify(nc));
    return true;
  }
  messageCallback = null;
  connectedCallback = null;
  disconnectedCallback = null;
  nameChangeCallback = null;
  onConnected(callback) {
    this.connectedCallback = callback;
  }
  onDisconnected(callback) {
    this.disconnectedCallback = callback;
  }
  onMessage(callback) {
    this.messageCallback = callback;
  }
  onNameChange(callback) {
    this.nameChangeCallback = callback;
  }
}
var localhostClient = new Client("ws://localhost:8080");
