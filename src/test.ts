import * as google from "./plugins/google";
import * as fs from "fs";

(async function () {
	console.log(`Start test at ${new Date()}`);
	let userData = require(`./out.json`);
	// let data = await google.classroom.test(userData);
	// console.log(data);
	// fs.writeFileSync(`./out.json`, JSON.stringify(data));
})();
