import { MessageContext, IMessageContextSendOptions } from "vk-io";
import Chat from "../lib/utils/classes/chat";
import User from "../lib/utils/classes/user";

export interface ModernMessageContext extends MessageContext {
	sendMessage(
		text: string | IMessageContextSendOptions,
		params?: IMessageContextSendOptions | undefined,
	): Promise<MessageContext<Record<string, any>>>;
	args: RegExpMatchArray;
	user: User;
	chat?: Chat;
}