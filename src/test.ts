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
	let data = require(`./DB/oldSchedules.json`);
	for (let tempFlow of data) {
		let newSpecialty: types.lessonsList = {
			uid: internalUtils.hash.md5(tempFlow.name),
			name: tempFlow.name,
			groups: [],
		};
		for (let tempGroup of tempFlow.groups) {
			const tempGroupHash = internalUtils.hash.md5(tempGroup.name);
			newSpecialty.groups.push({
				id: tempGroupHash,
				uid: internalUtils.hash.md5(`${tempGroup.name} | ${tempFlow.name}`),
				name: tempGroup.name,
				weekly_schedule: [],
			});
			let tempGroupInstance = newSpecialty.groups.find(
				(x) => x.id == tempGroupHash,
			);
			for (let tempDay of tempGroup.weekly_schedule) {
				//@ts-ignore
				tempGroupInstance.weekly_schedule.push({
					num: tempDay.num,
					place: tempDay.place,
					lessons: [],
				});
				let tempDayInstance = tempGroupInstance?.weekly_schedule.find(
					(x) => x.num === tempDay.num,
				);
				for (let tempLesson of tempDay.lessons) {
					//@ts-ignore
					tempDayInstance.lessons.push({
						num: tempLesson.num,
						name: tempLesson.name,
						teacher: tempLesson.teacher,
					});
				}
			}
		}
		let DB_Specialty = new models.specialty(newSpecialty);
		console.log(DB_Specialty);
		process.exit();
	}
})();
