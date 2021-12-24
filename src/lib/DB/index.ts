import mongoose from "mongoose";
import { ExtractDoc, typedModel } from "ts-mongoose";

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

class ApiInfo {
	public source: ExtractDoc<typeof apiSchemes.infoSchema>;
	constructor(source: ExtractDoc<typeof apiSchemes.infoSchema>) {
		this.source = source;
	}

	get isNumerator() {
		return this.source.currentWeek === "Числитель";
	}

	get isDenominator() {
		return this.source.currentWeek === "Знаменатель";
	}
}

class ApiDB extends DB {
	public info!: ApiInfo;

	constructor() {
		super({ dbName: "API" });
		this.connection.once("open", () => this.updateInfo());
	}

	public async updateInfo(): Promise<void> {
		const response = await this.models.info.findOne();
		if (response) {
			this.info = new ApiInfo(response);
		}
	}

	public readonly models = {
		info: typedModel(
			"info",
			apiSchemes.infoSchema,
			"info",
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
	config,
	api: new ApiDB(),
	bot: new BotDB(),
};
