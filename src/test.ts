import mongoose from "mongoose";
import utils from "rus-anonym-utils";
(async function () {
	utils.logger.console(`Connect to database...`);
	await mongoose.connect(`mongodb://194.32.248.158:27017/mpt_bot`, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	utils.logger.console(`Successfull connection to database`);
})();
