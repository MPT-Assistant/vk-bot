import DB from "./DB";
import VK from "./VK";

(async function () {
	await DB.api.connection.asPromise();
	console.log("API DB connected");
	await DB.bot.connection.asPromise();
	console.log("Bot DB connected");
	await VK.updates.start();
	console.log("Polling started");
})();
