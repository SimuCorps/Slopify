import type { ChatMessage, ChatMessageRequest, ChatUserConnectedAck, ChatUserCreateSession, ChatUserNameChangeAck, ChatUserNameChange, MessageUserType } from "../server/messages";
import { MessageType } from "../server/messages";

export type OnChatRecieved = (from: string, message: string, userType: MessageUserType) => void;
export type OnConnected = (username: string) => void;
export type OnDisconnected = () => void;
export type OnNameChange = (newName: string, success: boolean) => void;

const USER_NAME_STORAGE_ID = "sloppychat-username";
enum ClientState { Disconnected, Connected, InSession, Connecting, Reconnecting }

class Client {
    server: string;
    socket: WebSocket | null = null;

    reconnectInterval: number = 1000;
    reconnectHandle: Timer | null = null;

    userId: string | null = null;
    userName: string | null = null;

    state: ClientState = ClientState.Disconnected;

    constructor(server: string) {
        this.server = server;
        this.userName = localStorage.getItem(USER_NAME_STORAGE_ID) || null;
    }

    connect() {
        this._connect(false);
    }

    private _connect(isReconnect: boolean = false) {

        this.socket = new WebSocket(this.server); // triggers connection
        this.state = isReconnect ? ClientState.Reconnecting : ClientState.Connecting;

        this.socket.onopen = (ev) => {
            this.state = ClientState.Connected;
            console.info("Server connection established.");
        }

        this.socket.onclose = (ev) => {
            if ((this.state === ClientState.Connected || this.state === ClientState.InSession) && this.disconnectedCallback) {
                console.warn("Server connection lost.");
                this.disconnectedCallback();
            }

            this.state = ClientState.Disconnected;

            //  Reconnect
            if (this.reconnectHandle)
                clearTimeout(this.reconnectHandle);

            this.reconnectHandle = setTimeout(() => {
                this._connect(true);
            }, this.reconnectInterval);
        }

        this.socket.onerror = (error) => {
            error.preventDefault();
            if (this.state !== ClientState.Reconnecting && this.state !== ClientState.Connecting)
                console.error("Connection error", error, this.state);
        }

        this.socket.onmessage = async (ev) => {
            const data = JSON.parse(ev.data);
            const type: MessageType = data['type'];

            if (type === MessageType.ACK) {
                const ack = data as ChatUserConnectedAck;
                console.debug("Recieved ACK message on connect with ID", ack.userId);

                this.userId = ack.userId;

                if (!this.userName) {
                    this.userName = `slop-${this.userId.substring(0, 6)}`;
                    localStorage.setItem(USER_NAME_STORAGE_ID, this.userName);
                }

                const sr: ChatUserCreateSession = {
                    type: MessageType.SESSION_CREATE,
                    userId: this.userId,
                    desiredName: this.userName
                }
                this.socket!.send(JSON.stringify(sr));
                return;
            }

            if (type === MessageType.SESSION_ACK) {
                this.state = ClientState.InSession;

                if (this.connectedCallback) {
                    this.connectedCallback(this.userName!);
                }
            }

            if (type === MessageType.MSG_RESPONSE) {
                const msg = data as ChatMessage;
                console.debug("Chat message recieved from.", msg.userName);

                if (this.messageCallback) {
                    this.messageCallback(msg.userName, msg.message, msg.userType);
                }
                return;
            }

            if (type === MessageType.NAME_CHANGE_ACK) {
                const res = data as ChatUserNameChangeAck;
                if (res.success) {
                    this.userName = res.newName;
                    localStorage.setItem(USER_NAME_STORAGE_ID, this.userName);
                }
                if (this.nameChangeCallback) {
                    this.nameChangeCallback(res.newName, res.success);
                }
            }
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.state = ClientState.Disconnected;
        }
    }

    send(message: string): boolean {
        if (this.state !== ClientState.InSession || !this.socket) {
            console.warn("Sending message without client session.");
            return false;
        }
        const pr: ChatMessageRequest = {
            type: MessageType.MSG_REQUEST,
            userId: this.userId!,
            message: message
        }
        this.socket.send(JSON.stringify(pr));
        return true;
    }

    private changeName(newName: string): boolean {
        if (this.state !== ClientState.InSession || !this.socket) {
            console.warn("Trying to change name without session.");
            return false;
        }

        if (newName?.length < 3) {
            console.warn("Name too short.");
            return false;
        }

        const nc: ChatUserNameChange = {
            type: MessageType.NAME_CHANGE,
            userId: this.userId!,
            newName: newName
        };

        this.socket.send(JSON.stringify(nc));
        return true;
    }

    //  Callbacks

    private messageCallback: OnChatRecieved | null = null;
    private connectedCallback: OnConnected | null = null;
    private disconnectedCallback: OnDisconnected | null = null;
    private nameChangeCallback: OnNameChange | null = null;

    onConnected(callback: OnConnected) {
        this.connectedCallback = callback;
    }

    onDisconnected(callback: OnDisconnected) {
        this.disconnectedCallback = callback;
    }

    onMessage(callback: OnChatRecieved) {
        this.messageCallback = callback;
    }

    onNameChange(callback: OnNameChange) {
        this.nameChangeCallback = callback;
    }
}

const localhostClient = new Client("ws://localhost:8080");