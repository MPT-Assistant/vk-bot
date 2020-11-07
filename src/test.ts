import * as mpt from "./plugins/mpt";
import * as fs from "fs";
import mongoose from "mongoose";
import models from "./plugins/models";
import * as types from "./plugins/types";
import * as internalUtils from "./plugins/utils";

console.log(`Start at ${new Date()}`);
(async function () {
	await mongoose.connect("mongodb://194.32.248.158:27017/mpt_bot", {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	process.exit();
})();
