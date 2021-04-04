import mongoose from "mongoose";
import { typedModel } from "ts-mongoose";
import * as schemes from "../DB/schemes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Str = mongoose.Schema.Types.String as any;
Str.checkRequired((v: string) => v != null);

class DB {
	public connection: mongoose.Connection;

	constructor({
		url,
		login,
		password,
		database,
	}: {
		url: string;
		login: string;
		password: string;
		database: string;
	}) {
		this.connection = mongoose.createConnection(
			`mongodb+srv://${login}:${password}@${url}/${database}`,
			{
				useNewUrlParser: true,
				useUnifiedTopology: true,
				useCreateIndex: true,
			},
		);
	}
}

export class API_DB extends DB {
	constructor(config: {
		url: string;
		login: string;
		password: string;
		database: string;
	}) {
		super(config);
	}

	public models = {
		group: typedModel(
			"group",
			schemes.GroupSchema,
			"groups",
			undefined,
			undefined,
			this.connection,
		),

		specialty: typedModel(
			"specialty",
			schemes.SpecialtySchema,
			"specialties",
			undefined,
			undefined,
			this.connection,
		),

		replacement: typedModel(
			"replacement",
			schemes.ReplacementSchema,
			"replacements",
			undefined,
			undefined,
			this.connection,
		),

		dump: typedModel(
			"dump",
			schemes.DumpSchema,
			"dumps",
			undefined,
			undefined,
			this.connection,
		),
	};
}

export class Bot_DB extends DB {
	constructor(config: {
		url: string;
		login: string;
		password: string;
		database: string;
	}) {
		super(config);
	}

	public models = {
		user: typedModel(
			"user",
			schemes.UserSchema,
			"users",
			undefined,
			undefined,
			this.connection,
		),

		chat: typedModel(
			"chat",
			schemes.ChatSchema,
			"chats",
			undefined,
			undefined,
			this.connection,
		),
	};
}
