import { apiReference } from "@scalar/hono-api-reference";
import { serve, type ServerWebSocket } from "bun";
import { Hono } from "hono";
import { describeRoute, openAPISpecs } from "hono-openapi";
import { resolver, validator } from "hono-openapi/valibot";
import * as v from 'valibot';
import log from "./log";
import type {
    ChatMessage, ChatMessageRequest, ChatUserConnectedAck,
    ChatUserCreateSession,
    ChatUserCreateSessionAck,
    ChatUserKick,
    ChatUserNameChange,
    ChatUserNameChangeAck
} from "./messages";
import { MessageType, MessageUserType } from "./messages";
import { processBot } from "./bots";

//  set in .env file, used for admin routes
const ADMIN_KEY = process.env.CHAT_ADMIN_KEY;
const ANON_PREFIX = process.env.ANON_PREFIX || "slop-";
const RATE_LIMIT_MSG_PER_MINUTE = 20;   // 20 messages per minute
const RATE_LIMIT_RESET_MINUTES = 60;    // resets every hour

const httpPort = 8080;
const app = new Hono();

//  --------------------------------------------------------
//  Sockets
//  --------------------------------------------------------
export type WSocket = ServerWebSocket<unknown>;
export type WMessage = string | Buffer;

export interface ChatUser {
    userId: string;
    name: string;
    socket: WSocket;
}

const activeBans = new Map<string, boolean>();
const clients = new Map<string, ChatUser>();
const limiter = new Map<string, number>();

const limiterMs = RATE_LIMIT_RESET_MINUTES * 60 * 1000;

const resetLimit = () => {
    log.info("Rate limiter reset");
    limiter.clear();
    setTimeout(resetLimit, limiterMs);
}
setTimeout(resetLimit, limiterMs);

const onConnect = (ws: WSocket) => {

    if (activeBans.has(ws.remoteAddress)) {
        log.warn(`Banned IP ${ws.remoteAddress} tried to connect`);
        ws.close();
        return;
    }

    const id = crypto.randomUUID();
    log.info(`User connected: ${id} (${ws.remoteAddress})`);

    //  We generate info about user and pass it to them - they will re-send their old IDs if they are reconnecting
    const cr: ChatUserConnectedAck = {
        type: MessageType.ACK,
        userId: id,
    }
    ws.send(JSON.stringify(cr));
}

const onDisconnect = (ws: WSocket) => {
    for (const { userId: id, name, socket } of clients.values()) {
        if (socket === ws) {
            log.info(`User disconnected: ${name} (${clients.size})`);
            clients.delete(id);
        }
    }
}

const onMessage = async (ws: WSocket, message: WMessage) => {
    const request = JSON.parse(message.toString());
    const type: MessageType = request['type'];

    //  User connected - create session
    if (type === MessageType.SESSION_CREATE) {
        const req = request as ChatUserCreateSession;

        log.info(`User ${req.desiredName} session created with ID ${req.userId} (${clients.size + 1})`);

        const cu: ChatUser = {
            userId: req.userId,
            name: req.desiredName,
            socket: ws
        };
        clients.set(req.userId, cu);

        //  Acknowledge session creation
        const sr: ChatUserCreateSessionAck = {
            type: MessageType.SESSION_ACK
        }
        ws.send(JSON.stringify(sr));
    }

    //  New chat message
    if (type === MessageType.MSG_REQUEST) {
        const req = request as ChatMessageRequest;
        const sentBy = clients.get(req.userId);

        if (!sentBy) {
            log.warn("Recieved payload from unknown user");
            return;
        }

        const sentCount = limiter.get(ws.remoteAddress) || 0;
        if (sentCount > RATE_LIMIT_MSG_PER_MINUTE * RATE_LIMIT_RESET_MINUTES) {
            log.warn(`Rate limit exceeded for ${sentBy.name}`);
            return;
        }
        limiter.set(ws.remoteAddress, sentCount + 1);

        log.debug(`-> ${sentBy.name} ${req.message}`);

        const rp: ChatMessage = {
            type: MessageType.MSG_RESPONSE,
            userType: MessageUserType.User,
            userName: sentBy.name,
            message: req.message
        }

        //  process bot
        const botReply = await processBot(ws!, req.message, sentBy.name, req.userId);

        //  Broadcast to all
        for (const { userId, socket } of clients.values()) {
            const senderItself = req.userId === userId; 
            
            if (!senderItself) {
                socket.send(JSON.stringify(rp));    
            }

            if (botReply){
                if (botReply.onlyToSender && !senderItself) 
                    continue;
                
                const botMsg: ChatMessage = {
                    type: MessageType.MSG_RESPONSE,
                    userType: MessageUserType.Bot,
                    userName: botReply.botName,
                    message: botReply.message
                }
                socket.send(JSON.stringify(botMsg));
            }
        }
    }

    //  User name change
    if (type === MessageType.NAME_CHANGE) {
        const req = request as ChatUserNameChange;
        const user = clients.get(req.userId);
        const isAuthenticated = false;

        if (!user) {
            log.warn("Recieved name change request from unknown user");
            return;
        }

        //  Validate
        let duplicate = false;
        for (const { name } of clients.values()) {
            if (name === req.newName) {
                duplicate = true;
                break;
            }
        }

        log.debug(`User ${user?.name} changed name to ${req.newName}`);
        user.name = isAuthenticated ? req.newName : `${ANON_PREFIX}${req.newName}`;
        clients.set(req.userId, user);

        const ack: ChatUserNameChangeAck = {
            type: MessageType.NAME_CHANGE_ACK,
            success: !duplicate,
            newName: !duplicate ? user.name : req.newName
        }
        ws.send(JSON.stringify(ack));
    }
}

//  --------------------------------------------------------
//  Web
//  --------------------------------------------------------

//  Docs and status 

app.get('/openapi', openAPISpecs(app, {
    documentation: {
        info: { title: 'Sloppy Chat API', version: '1.0.0', description: 'Simple websocket based chat server and client' },
        servers: [{ url: `http://localhost:${httpPort}`, description: 'Local Server' }],
    },
}));

app.get('/docs', apiReference({
    theme: 'saturn',
    spec: { url: '/openapi' },
}));

//  Routes

app.onError((err, c) => {
    log.error(err);
    c.status(500);
    return c.json({ message: err.message, cause: err.cause, stack: err.stack });
});

const StatusResponse = v.object({
    clients: v.number()
});

app.get("/status",
    describeRoute({
        description: "Server status",
        responses: {
            200: { description: "Success", content: { 'application/json': { schema: resolver(StatusResponse) } } }
        }
    }),
    async (c) => {
        return c.json({
            clients: clients.size
        });
    }
);

const ChatKickRequest = v.object({
    adminKey: v.string(),
    userId: v.optional(v.string()),
    name: v.optional(v.string())
});

const ChatKickResponse = v.object({
    message: v.optional(v.string()),
    success: v.boolean(),
});

app.get('/chat/kick',
    describeRoute({
        description: "Kicks the user out of the chat",
        responses: {
            200: { description: "Success", content: { 'application/json': { schema: resolver(ChatKickResponse) } } }
        }
    }),
    validator('query', ChatKickRequest),
    async (c) => {
        const key = c.req.query("adminKey");
        const id = c.req.query("id");
        const reqName = c.req.query("name");

        if (key !== ADMIN_KEY) {
            log.warn("Invalid admin key");
            return c.json({
                message: "Invalid admin key",
                success: false
            });
        }

        if (!id && !reqName) {
            log.warn("No user specified");
            return c.json({
                message: "No user specified",
                success: false
            });
        }

        log.info(`Kicking user ${reqName} with id ${id}`);

        for (const { userId, name, socket } of clients.values()) {
            if (userId === id || reqName === name) {

                //  Inform user (but ignore any possible excption)
                try {
                    const kick: ChatUserKick = {
                        type: MessageType.USER_KICK,
                        message: "You have been kicked from the chat"
                    }
                    socket.send(JSON.stringify(kick));

                    socket.close();
                    clients.delete(userId);
                } catch (err) { }

                activeBans.set(socket.remoteAddress, true);
                break;
            }
        }

        return c.json({
            success: true
        });
    }
);

const ChatRestoreAccess = v.object({
    adminKey: v.string(),
    ip: v.string(),
});

app.get("/chat/restore",
    describeRoute({
        description: "Removes a ban for an IP",
        responses: {
            200: { description: "Success", content: { 'application/json': { schema: resolver(ChatKickResponse) } } }
        }
    }),
    validator('query', ChatRestoreAccess),
    async (c) => {
        const key = c.req.query("adminKey");
        const ip = c.req.query("ip");

        if (key !== ADMIN_KEY) {
            log.warn("Invalid admin key");
            return c.json({
                message: "Invalid admin key",
                success: false
            });
        }

        if (!activeBans.has(ip!)) {
            log.warn(`IP ${ip} not banned`);
            return c.json({
                message: "IP not banned",
                success: false
            });
        }

        log.info(`Banning IP ${ip}`);

        activeBans.delete(ip!);

        return c.json({
            success: true
        });
    }
);

app.get("/",
    (c) => {
        log.debug("Root page request");
        return c.html("Hello to Sloppy Chat. Click here for <a href='/docs'> API </a>.");
    }
);

//  --------------------------------------------------------
//  Server boostrap
//  --------------------------------------------------------
log.debug(`Starting server on port ${httpPort}`);

const server = serve({
    fetch: (req, server) => {
        if (req.headers.get("upgrade") === "websocket") {
            server.upgrade(req);
            return;
        }
        return app.fetch(req, server);
    },
    port: httpPort,
    websocket: {
        open(ws) { onConnect(ws) },
        close(ws) { onDisconnect(ws) },
        async message(ws, message) { await onMessage(ws, message) }
    }
});

log.info(`Server listening on ${server.url}`);