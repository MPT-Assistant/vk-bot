import * as google from "./plugins/google";
import * as fs from "fs";

(async function () {
	console.log(`Start test at ${new Date()}`);
	let userData = require(`./out.json`);
	let user = new google.classroomUser(userData);
	let data = await user.getCourses();
	console.log(data);
	// fs.writeFileSync(`./out.json`, JSON.stringify(data));
})();
