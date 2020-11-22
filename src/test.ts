import * as mpt from "./plugins/mpt";
import * as fs from "fs";
import mongoose, { model } from "mongoose";
import models from "./plugins/models";
import * as types from "./plugins/types";
import * as internalUtils from "./plugins/utils";
import { google, GoogleUser } from "./plugins/google";

console.log(`Start at ${new Date()}`);
console.time(`Executed in`);
(async function () {
	await mongoose.connect("mongodb://194.32.248.158:27017/mpt_bot", {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	let userGoogle = new GoogleUser(266982306);
	if (!(await userGoogle.init())) {
		console.log(`not found`);
		process.exit();
	}
	console.log(await userGoogle.getTokenInfo());
	await userGoogle.save();
	console.timeEnd(`Executed in`);
	process.exit();
})();
