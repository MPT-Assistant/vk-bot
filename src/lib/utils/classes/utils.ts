import MPT from "./mpt";
import * as DB from "./DB";
import Logger from "../logger";

import config from "../../../DB/config.json";
import TextCommand from "./textCommand";
class Utils {
	public logger = new Logger();
	public mpt = new MPT();
	public API_DB = new DB.API_DB({
		url: config.mongo.address,
		login: config.mongo.login,
		password: config.mongo.password,
		database: "API",
	});
	public Bot_DB = new DB.Bot_DB({
		url: config.mongo.address,
		login: config.mongo.login,
		password: config.mongo.password,
		database: "vk",
	});
	public config = config;
	public textCommand: TextCommand[] = [];
	public textCommandsTemplates: string[] = [];
}

export default new Utils();
