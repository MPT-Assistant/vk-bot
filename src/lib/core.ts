import { getRandomId, Keyboard } from "vk-io";
import InternalUtils from "./utils/classes/utils";
import { Interval } from "simple-scheduler-task";
import "../commands/textCommands/loader";
import "../commands/eventCommands/loader";
import vk from "./vk";
import moment from "moment";

new Interval(async () => {
	await InternalUtils.mpt.getLastDump();
}, 30000);

new Interval(async () => {
	for (const replacement of InternalUtils.mpt.data.replacements) {
		const usersNotInformed = await InternalUtils.Bot_DB.models.user.find({
			group: replacement.group,
			inform: true,
			reported_replacements: {
				$nin: [replacement.hash],
			},
		});
		usersNotInformed.map(async (user) => {
			user.reported_replacements.push(replacement.hash);
			user.markModified("reported_replacements");
			const replacementDate = moment(replacement.date).format("DD.MM.YYYY");
			try {
				await vk.api.messages.send({
					peer_id: user.id,
					random_id: getRandomId(),
					message: `Обнаружена новая замена на ${replacementDate}
Пара: ${replacement.lessonNum}
Заменяемая пара: ${replacement.oldLessonName}
Преподаватель: ${replacement.oldLessonTeacher}
Новая пара: ${replacement.newLessonName}
Преподаватель на новой паре: ${replacement.newLessonTeacher}
Добавлена на сайт: ${moment(replacement.addToSite).format(
						"HH:mm:ss | DD.MM.YYYY",
					)}
Обнаружена ботом: ${moment(replacement.detected).format(
						"HH:mm:ss | DD.MM.YYYY",
					)}`,
					keyboard: Keyboard.builder()
						.inline()
						.textButton({
							label: "Расписание",
							payload: {
								command: `Расписание ${replacementDate}`,
							},
							color: Keyboard.SECONDARY_COLOR,
						})
						.row()
						.textButton({
							label: "Отключить рассылку",
							payload: {
								command: "Изменения отключить",
							},
							color: Keyboard.NEGATIVE_COLOR,
						}),
				});
			} catch (error) {
				user.inform = false;
			}
			await user.save();
		});
		const chatsNotInformed = await InternalUtils.Bot_DB.models.chat.find({
			group: replacement.group,
			inform: true,
			reported_replacements: {
				$nin: [replacement.hash],
			},
		});
		chatsNotInformed.map(async (chat) => {
			chat.reported_replacements.push(replacement.hash);
			chat.markModified("reported_replacements");
			const replacementDate = moment(replacement.date).format("DD.MM.YYYY");
			try {
				await vk.api.messages.send({
					chat_id: chat.id,
					random_id: getRandomId(),
					message: `Обнаружена новая замена на ${replacementDate}
Пара: ${replacement.lessonNum}
Заменяемая пара: ${replacement.oldLessonName}
Преподаватель: ${replacement.oldLessonTeacher}
Новая пара: ${replacement.newLessonName}
Преподаватель на новой паре: ${replacement.newLessonTeacher}
Добавлена на сайт: ${moment(replacement.addToSite).format(
						"HH:mm:ss | DD.MM.YYYY",
					)}
Обнаружена ботом: ${moment(replacement.detected).format(
						"HH:mm:ss | DD.MM.YYYY",
					)}`,
					keyboard: Keyboard.builder()
						.inline()
						.textButton({
							label: "Расписание",
							payload: {
								command: `Расписание ${replacementDate}`,
							},
							color: Keyboard.SECONDARY_COLOR,
						})
						.row()
						.textButton({
							label: "Отключить рассылку",
							payload: {
								command: "Изменения отключить",
							},
							color: Keyboard.NEGATIVE_COLOR,
						}),
				});
			} catch (error) {
				chat.inform = false;
			}

			await chat.save();
		});
	}
}, 1.5 * 60 * 1000);

InternalUtils.API_DB.connection.once("open", connectDB_Handler);

InternalUtils.Bot_DB.connection.once("open", connectDB_Handler);

function connectDB_Handler() {
	if (
		InternalUtils.API_DB.connection.readyState === 1 &&
		InternalUtils.Bot_DB.connection.readyState === 1
	) {
		InternalUtils.mpt.getLastDump();
		vk.updates
			.startPolling()
			.then(() => console.log("Polling started at", new Date()));
	}
}
