import { ExtractDoc } from "ts-mongoose";
import { IMessageContextSendOptions, MessageContext } from "vk-io";

import DB from "../lib/DB";

interface MessageContextState {
	args: RegExpExecArray;
}

interface GroupMessageContextState extends MessageContextState {
	user: ExtractDoc<typeof DB.bot.schemes.userSchema>;
	chat?: ExtractDoc<typeof DB.bot.schemes.chatSchema>;
	sendMessage(
		text: string | IMessageContextSendOptions,
		params?: IMessageContextSendOptions,
	): Promise<MessageContext<Record<string, unknown>>>;
}

export { GroupMessageContextState };
