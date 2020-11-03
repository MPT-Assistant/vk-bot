import { IQuestionMessageContext } from "vk-io-question";
import { Document } from "mongoose";
import { MessageContext, IMessageContextSendOptions } from "vk-io";
export interface MPTCommand {
	regexp: RegExp;
	process: Function;
}

export interface MPTMessage extends MessageContext, IQuestionMessageContext {
	sendMessage(
		text: string | IMessageContextSendOptions,
		params?: IMessageContextSendOptions | undefined,
	): Promise<MessageContext<Record<string, any>>>;
	user: UserInterface;
	chat?: ChatInterface;
}

export interface UserInterface extends Document {
	id: number;
	vk_id: number;
	ban: boolean;
	reg_date: Date;
	nickname: string;
	data: {
		unical_group_id: number;
	};
}

export interface ChatInterface extends Document {
	id: number;
	unical_group_id: number;
	inform: boolean;
}

export interface GoogleUserData {
	access_token: string;
	refresh_token: string;
	scope: string;
	token_type: string;
	expiry_data: number;
}