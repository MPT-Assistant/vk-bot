import { IMessageContextSendOptions, MessageContext } from "vk-io";

interface MessageContextState {
	args: RegExpExecArray;
}

interface GroupMessageContextState extends MessageContextState {
	sendMessage(
		text: string | IMessageContextSendOptions,
		params?: IMessageContextSendOptions,
	): Promise<MessageContext<Record<string, unknown>>>;
}

export { GroupMessageContextState };
