class TunnelConnection {
  // A valid config object should have the following properties:
  // encryption: boolean;
  // compression: boolean;
  // random: boolean;
  // firstuser: boolean;
  constructor(host, tunnelId, subChannel, callback, config) {
    this.host = new URL(host);
    this.tunnelId = tunnelId;
    this.subChannel = subChannel || "main";
    this.callback = callback;
    this.config = config || {
      encryption: false,
      compression: false,
      random: false,
    };

    this.eventSource = null;

    // Ensure config properties are set
    this.config.encryption = !!this.config.encryption;
    this.config.compression = !!this.config.compression;
    this.config.random = !!this.config.random;
  }

  async init() {
    if (this.config.encryption) {
      this.keys = {};
      await this.#generateKeys();

      // Bind the handler to preserve 'this' context
      this.keyExchange = new TunnelConnection(
        this.host,
        this.tunnelId,
        "keyExchange",
        this.#handleKeyExchange.bind(this),
        null,
      );
      await this.keyExchange.init();
      this.keyExchange.connect();

      if (!this.config.firstuser) {
        await this.#sendKeys();
      }
    }
  }

  async #compressData(data) {
    const encoder = new TextEncoder();
    const input = encoder.encode(data);
    const compressedStream = new CompressionStream("gzip");
    const writer = compressedStream.writable.getWriter();
    writer.write(input);
    writer.close();
    const compressedArrayBuffer = await new Response(
      compressedStream.readable,
    ).arrayBuffer();
    return this.#arrayBufferToBase64(compressedArrayBuffer);
  }

  async #decompressData(data) {
    const compressedArrayBuffer = await this.#base64ToArrayBuffer(data);
    const decompressedStream = new DecompressionStream("gzip");
    const writer = decompressedStream.writable.getWriter();
    writer.write(compressedArrayBuffer);
    writer.close();
    const decompressedArrayBuffer = await new Response(
      decompressedStream.readable,
    ).arrayBuffer();
    const decoder = new TextDecoder();
    return decoder.decode(decompressedArrayBuffer);
  }

  async #base64ToArrayBuffer(base64) {
    return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)).buffer;
  }

  async #arrayBufferToBase64(buffer) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
  }

  #hextoArrayBuffer(hex) {
    let bytes = [];
    for (let c = 0; c < hex.length; c += 2) {
      bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return new Uint8Array(bytes).buffer;
  }

  #arrayBufferToHex(buffer) {
    return Array.prototype.map
      .call(new Uint8Array(buffer), (x) => ("00" + x.toString(16)).slice(-2))
      .join("");
  }

  async #decryptData(data, privateKey) {
    console.log("Decrypting data...");

    const privateKeyObj = await window.crypto.subtle.importKey(
      "pkcs8",
      this.#hextoArrayBuffer(privateKey),
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      false,
      ["decrypt"],
    );

    const encryptedBuffer = this.#hextoArrayBuffer(data);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      privateKeyObj,
      encryptedBuffer,
    );

    const decryptedText = new TextDecoder().decode(decryptedBuffer);
    console.log("Data decrypted.");
    return decryptedText;
  }

  async #encryptData(data, publicKey) {
    console.log("Encrypting data...");

    const publicKeyObj = await window.crypto.subtle.importKey(
      "spki",
      this.#hextoArrayBuffer(publicKey),
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      false,
      ["encrypt"],
    );

    const dataBuffer = new TextEncoder().encode(data);

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      publicKeyObj,
      dataBuffer,
    );

    const encryptedHex = this.#arrayBufferToHex(encryptedBuffer);
    console.log("Data encrypted.");
    return encryptedHex;
  }

  async #generateKeys() {
    console.log("Generating keys...");
    this.userID = window.crypto.getRandomValues(new Uint32Array(4)).join("");
    this.tunnelKey = window.crypto.getRandomValues(new Uint32Array(1)).join("");
    console.log(`Generated userID: ${this.userID}`);
    this.keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"],
    );
    console.log("Key pair generated.");
    const exportedKey = await window.crypto.subtle.exportKey(
      "spki",
      this.keyPair.publicKey,
    );
    this.keys[this.userID] = {
      publicKey: this.#arrayBufferToHex(exportedKey),
    };
    console.log("Keys stored:", this.keys);
  }

  async #handleKeyExchange(event) {
    try {
      let keyExchangeData =
        typeof event === "string" ? JSON.parse(event) : event;

      console.log(
        `Received key exchange event from userID: ${keyExchangeData.userID}`,
      );

      if (!keyExchangeData.userID || !keyExchangeData.publicKey) {
        console.error("Invalid key exchange data received");
        return;
      }

      if (keyExchangeData.userID === this.userID) {
        console.log("Ignoring key exchange event from self.");
        return;
      }

      this.keys = this.keys || {};

      if (this.keys[keyExchangeData.userID]) {
        console.log("Public key for this userID already exists.");
        return;
      }

      this.keys[keyExchangeData.userID] = {
        publicKey: keyExchangeData.publicKey,
      };

      console.log("Updated keys:", this.keys);
      await this.#sendKeys();
    } catch (error) {
      console.error("Error handling key exchange:", error);
    }
  }

  async #exportPrivateKey() {
    const exportedKey = await window.crypto.subtle.exportKey(
      "pkcs8",
      this.keyPair.privateKey,
    );
    return this.#arrayBufferToHex(exportedKey);
  }

  async #sendKeys() {
    while (!this.keys[this.userID]?.publicKey) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    let encodedPublicKey = this.keys[this.userID]?.publicKey;
    let keyExchangeData = { userID: this.userID, publicKey: encodedPublicKey };
    this.keyExchange.send(JSON.stringify(keyExchangeData));
  }

  async create() {
    if (!this.config.random) {
      let createURL = new URL("api/v3/tunnel/create", this.host);
      let requestBody = {
        id: this.tunnelId,
      };
      return fetch(createURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }).then((response) => {
        if (response.ok) {
          return true;
        }
        throw new Error("Failed to create tunnel");
      });
    } else {
      let createURL = new URL("api/v3/tunnel/create", this.host);
      return fetch(createURL, {
        method: "GET",
      }).then((response) => {
        if (response.ok) {
          return response.json().then((data) => {
            this.tunnelId = data.id;
            return data.id;
          });
        }
        throw new Error("Failed to create tunnel");
      });
    }
  }

  connect() {
    let SSEURL = new URL("api/v3/tunnel/stream", this.host);
    SSEURL.searchParams.append("id", this.tunnelId);
    SSEURL.searchParams.append("subChannel", this.subChannel);
    let eventSource = new EventSource(SSEURL);

    if (this.callback && !this.config.encryption && !this.config.compression) {
      eventSource.addEventListener("message", (event) => {
        this.callback(event.data);
      });
    } else if (this.callback && this.config.encryption) {
      eventSource.addEventListener("message", async (event) => {
        let message = JSON.parse(event.data);
        if (message[this.userID]) {
          try {
            const privateKeyHex = await this.#exportPrivateKey();
            const decryptedData = await this.#decryptData(
              message[this.userID],
              privateKeyHex,
            );
            this.callback(decryptedData);
          } catch (error) {
            console.error("Decryption failed:", error);
          }
        }
      });
    }

    this.eventSource = eventSource;
    return eventSource;
  }

  async send(data) {
    if (this.config.encryption) {
      let sendURL = new URL("api/v3/tunnel/send", this.host);
      let messageBody = {};
      for (let userID in this.keys) {
        if (this.keys.hasOwnProperty(userID)) {
          if (userID === this.userID) return;
          messageBody[userID] = await this.#encryptData(
            data,
            this.keys[userID].publicKey,
          );
          console.log(
            `Encrypted message for userID: ${userID}`,
            messageBody[userID],
          );
        }
      }

      let requestBody = {
        id: this.tunnelId,
        subChannel: this.subChannel,
        content: JSON.stringify(messageBody),
      };
      fetch(sendURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }).then((response) => {
        if (!response.ok) {
          throw new Error("Failed to send data");
        }
      });
    } else {
      let sendURL = new URL("api/v3/tunnel/send", this.host);
      let requestBody = {
        id: this.tunnelId,
        subChannel: this.subChannel,
        content: data,
      };
      fetch(sendURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }).then((response) => {
        if (!response.ok) {
          throw new Error("Failed to send data");
        }
      });
    }
  }

  close() {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}
