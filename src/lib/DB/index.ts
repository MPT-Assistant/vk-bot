import mongoose from "mongoose";
import { ExtractDoc, ExtractProps, typedModel } from "ts-mongoose";

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
	public config!: ExtractDoc<typeof apiSchemes.configScheme>;

	constructor() {
		super({ dbName: "API" });
		this.connection.once("open", () => this.updateConfig());
	}

	public async updateConfig(): Promise<void> {
		const response = await this.models.config.findOne();
		if (response) {
			this.config = response;
		}
	}

	public readonly models = {
		config: typedModel(
			"config",
			apiSchemes.configScheme,
			"config",
			undefined,
			undefined,
			this.connection,
		),
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
		super({ dbName: "vk" });
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
