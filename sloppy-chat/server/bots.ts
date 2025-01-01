//  This is to process the bot messages
import { type ServerWebSocket } from "bun";;

export interface BotReply {
    botName: string;
    message: string;
    onlyToSender: boolean;
}

export async function processBot(ws: ServerWebSocket<unknown>, message: string, userName: string, userId: string): Promise<BotReply | null> {
    if (!message.startsWith("!")) {
        return null;
    }

    if (message === "!ping") {
        return {
            botName: "~SloppyPong~",
            message: "Pong!",
            onlyToSender: false
        };
    }

    return null;
}