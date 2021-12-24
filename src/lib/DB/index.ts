import mongoose from "mongoose";
import { typedModel } from "ts-mongoose";

import config from "../../DB/config.json";

import apiSchemes from "./apiSchemes";
import botSchemes from "./botSchemes";

class DB {
	public readonly connection: mongoose.Connection;

	constructor({ dbName }: { dbName: string }) {
		this.connection = mongoose.createConnection(
			`${config.mongo.protocol}://${config.mongo.login}:${config.mongo.password}@${config.mongo.address}/${dbName}`,
			{
				autoCreate: true,
				autoIndex: true,
			},
		);
	}
}

class ApiDB extends DB {
	constructor() {
		super({ dbName: "API" });
	}

	public readonly models = {
		group: typedModel(
			"group",
			apiSchemes.groupSchema,
			"groups",
			undefined,
			undefined,
			this.connection,
		),
		replacement: typedModel(
			"replacement",
			apiSchemes.replacementSchema,
			"replacements",
			undefined,
			undefined,
			this.connection,
		),
	};
}

class BotDB extends DB {
	constructor() {
		super({ dbName: "vk-bot" });
	}

	public readonly models = {
		user: typedModel(
			"user",
			botSchemes.userSchema,
			"users",
			undefined,
			undefined,
			this.connection,
		),
		chat: typedModel(
			"chat",
			botSchemes.chatSchema,
			"chats",
			undefined,
			undefined,
			this.connection,
		),
	};
}

export default {
	api: new ApiDB(),
	bot: new BotDB(),
};