import * as google from "./plugins/google";
import * as fs from "fs";

(async function () {
	console.log(`Start test at ${new Date()}`);
	let userData = require(`./out.json`);
	let user = new google.classroomUser(userData);
	let userCourses = await user.courses.list();
	if (userCourses && userCourses[0].id) {
		let data = await user.announcements.list(`181540834150`);
		// console.log(userCourses);
		console.log(data);
	}

	// fs.writeFileSync(`./out.json`, JSON.stringify(data));
})();
