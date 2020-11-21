import * as mpt from "./plugins/mpt";
import * as fs from "fs";
import mongoose, { model } from "mongoose";
import models from "./plugins/models";
import * as types from "./plugins/types";
import * as internalUtils from "./plugins/utils";
import { google, googleUser } from "./plugins/google";

console.log(`Start at ${new Date()}`);
console.time(`Executed in`);
(async function () {
	await mongoose.connect("mongodb://194.32.248.158:27017/mpt_bot", {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	let userGoogle = await models.userGoogle.findOne({ vk_id: 266982306 });
	if (!userGoogle) {
		console.log(`not found`);
		process.exit();
	}
	//@ts-ignore
	let newToken = await google.refreshToken(userGoogle.token);
	console.log(newToken);
	console.log(userGoogle.token);
	//@ts-ignore
	userGoogle.token.access_token = newToken;
	//@ts-ignore
	console.log(await google.checkUserToken(userGoogle.token));
	console.timeEnd(`Executed in`);
	process.exit();
})();
