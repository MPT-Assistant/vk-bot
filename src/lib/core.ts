import moment from "moment";

import DB from "./DB";
import VK from "./VK";
import utils from "./utils";

import "./commands/textCommandsLoader";

(async function () {
	await DB.api.connection.asPromise();
	console.log("API DB connected");
	await DB.bot.connection.asPromise();
	console.log("Bot DB connected");
	await VK.updates.start();
	console.log("Polling started");

	console.log(await utils.mpt.getGroupSchedule("СА50-1-18", moment()));
})();
