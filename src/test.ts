import * as mpt from "./plugins/mpt";
import * as fs from "fs";

console.log(`Start at ${new Date()}`);
(async function () {
	let timetable = await mpt.mpt.parseTimetable();
	console.log(timetable[0]);
	let data = timetable.find((x) => x.num == 1 && x.lesson == true);
	console.log(data);
})();
