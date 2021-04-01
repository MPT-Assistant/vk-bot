import { MessageContext, IMessageContextSendOptions } from "vk-io";
import User from "../lib/utils/classes/user";

export interface ModernMessageContext extends MessageContext {
	sendMessage(
		text: string | IMessageContextSendOptions,
		params?: IMessageContextSendOptions | undefined,
	): Promise<MessageContext<Record<string, any>>>;
	user: User;
	// chat?: chatDocInterface;
}
