import MPT from "../utils/mpt";
import DB from "../utils/DB";
import Logger from "../utils/logger";

import config from "../../DB/config.json";
import Command from "./command";
class Utils {
	public logger = new Logger();
	public mpt = new MPT();
	public DB: DB = new DB({
		url: config.mongo.address,
		login: config.mongo.login,
		password: config.mongo.password,
		database: "API",
	});
	public config = config;
	public commands: Command[] = [];
	public commandsTemplates: string[] = [];
}

export default new Utils();
