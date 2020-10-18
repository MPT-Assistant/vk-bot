


setInterval(async () => {
	await mpt.Update_all_shedule();
	await mpt.Update_all_replacements();
}, 5 * 60 * 1000);

(async function () {
	logger.console(`Connect to database...`);
	await mongoose.connect("mongodb://194.32.248.158:27017/mpt_bot", {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	logger.console(`Successfull connection to database`);
	logger.console(`Updating data...`);
	await mpt.Update_all_shedule();
	await mpt.Update_all_replacements();
	logger.console(`Successfull data update`);
	logger.console(`Loading commands...`);
	fs.readdirSync("./commands")
		.filter((x) => x.endsWith(".js"))
		.map((x) => commands.push(require("./commands/" + x)));
	logger.console(`Successfull loading commands (${commands.length})`);
	logger.console(`Connect to VK LongPoll...`);
	await vk.updates.startPolling();
	logger.console(`Successfull connection to VK LongPoll`);
	await logger.console(`Script start`);
})();
