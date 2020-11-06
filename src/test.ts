import * as mpt from "./plugins/mpt";
import * as fs from "fs";
import mongoose from "mongoose";
import schemes from "./plugins/schemes";

console.log(`Start at ${new Date()}`);
(async function () {
	await mongoose.connect("mongodb://194.32.248.158:27017/mpt_bot", {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	let data = await mongoose
		.model("specialty", schemes.specialty, `specialties`)
		.find();
	fs.writeFileSync(`./out.json`, JSON.stringify(data));
	process.exit();
})();
