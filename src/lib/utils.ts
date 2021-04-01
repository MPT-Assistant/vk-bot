import MPT from "./utils/mpt";
import DB from "./utils/DB";

import config from "../DB/config.json";

class Utils {
	public mpt = new MPT();
	public DB: DB = new DB({
		url: config.mongo.address,
		login: config.mongo.login,
		password: config.mongo.password,
		database: "API",
	});
}

export default new Utils();
