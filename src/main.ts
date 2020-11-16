import {
	commandsLoader,
	commands,
	vk,
	mongoose,
	scheduler,
	mpt,
	config,
} from "./plugins/core";
import utils from "rus-anonym-utils";

(async function () {
	utils.logger.console(`Connect to database...`);
	await mongoose.connect(config.mongo, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	utils.logger.console(`Successfull connection to database`);
	utils.logger.console(`Updating data...`);
	await mpt.updateSchedule();
	await mpt.Update_all_replacements();
	utils.logger.console(`Successfull data update`);
	utils.logger.console(`Loading commands...`);
	await commandsLoader(`./commands`);
	utils.logger.console(`Successfull loading commands (${commands.length})`);
	utils.logger.console(`Connect to VK LongPoll...`);
	await vk.updates.startPolling();
	utils.logger.console(`Successfull connection to VK LongPoll`);
	utils.logger.console(`Beginning task scheduling...`);
	await scheduler.tasks.add({
		isInterval: true,
		intervalTimer: 5 * 60 * 1000,
		code: async function () {
			await mpt.updateSchedule();
			await mpt.Update_all_replacements();
		},
	});
	utils.logger.console(`Tasks are planned`);
	utils.logger.console(`Script start`);
})();
