import { IQuestionMessageContext } from "vk-io-question";
import { Document } from "mongoose";
import { MessageContext, IMessageContextSendOptions } from "vk-io";
import { ExtractDoc } from "ts-mongoose";
import schemes from "./schemes";
export interface MPTCommand {
	regexp: RegExp;
	process: Function;
}

export interface MPTMessage extends MessageContext, IQuestionMessageContext {
	sendMessage(
		text: string | IMessageContextSendOptions,
		params?: IMessageContextSendOptions | undefined,
	): Promise<MessageContext<Record<string, any>>>;
	user: userDocInterface;
	chat?: chatDocInterface;
	pageBuilder: any;
}

export interface GoogleUserData {
	access_token: string;
	refresh_token: string;
	scope: string;
	token_type: string;
	expiry_date: number;
}

export interface timetableElement {
	lesson: boolean;
	num: number;
	start: Date;
	end: Date;
	status: "finished" | "started" | "not_start" | string;
	diff_start: {
		years: number;
		months: number;
		days: number;
		hours: number;
		minutes: number;
		seconds: number;
		firstDateWasLater: boolean;
	};
	diff_end: {
		years: number;
		months: number;
		days: number;
		hours: number;
		minutes: number;
		seconds: number;
		firstDateWasLater: boolean;
	};
}

export interface specialtyInterface {
	uid: string;
	name: string;
	groups: Array<{
		id: string;
		name: string;
		uid: string;
		weekly_schedule: Array<{
			num: number;
			place: string;
			lessons: Array<{
				num: number;
				name: Array<string>;
				teacher: Array<string>;
			}>;
		}>;
	}>;
}

export interface mongoSpecialtyInterface extends Document, specialtyInterface {}

export interface replacementInterface {
	date: string;
	unical_group_id: string;
	detected: Date;
	add_to_site: Date;
	lesson_num: number;
	old_lesson_name: string;
	old_lesson_teacher: string;
	new_lesson_name: string;
	new_lesson_teacher: string;
}

export interface mongoReplacementInterface
	extends Document,
		replacementInterface {}

export interface utilityGroup extends Document {
	uid: string;
	name: string;
	id: string;
	specialty: string;
	specialty_id: string;
}

export type userGoogleInterface = ExtractDoc<typeof schemes.googleScheme>;
export type userDocInterface = ExtractDoc<typeof schemes.user>;
export type chatDocInterface = ExtractDoc<typeof schemes.chat>;
