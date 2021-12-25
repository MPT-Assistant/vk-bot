import DB from "./DB";
import VK from "./VK";

import "./commands/textCommandsLoader";
import "./commands/eventCommandsLoader";
import moment from "moment";
import { getRandomId, Keyboard } from "vk-io";

async function tempUpdate() {
	DB.api.updateInfo();

	for await (const replacement of DB.api.models.replacement.find({})) {
		const usersNotInformed = await DB.bot.models.user.find({
			group: replacement.group,
			inform: true,
			reportedReplacements: {
				$nin: [replacement.hash],
			},
		});
		usersNotInformed.map(async (user) => {
			user.reportedReplacements.push(replacement.hash);
			user.markModified("reportedReplacements");
			const replacementDate = moment(replacement.date).format("DD.MM.YYYY");
			try {
				await VK.api.messages.send({
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
		const chatsNotInformed = await DB.bot.models.chat.find({
			group: replacement.group,
			inform: true,
			reportedReplacements: {
				$nin: [replacement.hash],
			},
		});
		chatsNotInformed.map(async (chat) => {
			chat.reportedReplacements.push(replacement.hash);
			chat.markModified("reportedReplacements");
			const replacementDate = moment(replacement.date).format("DD.MM.YYYY");
			try {
				await VK.api.messages.send({
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
}

(async function () {
	await DB.api.connection.asPromise();
	console.log("API DB connected");
	await DB.bot.connection.asPromise();
	console.log("Bot DB connected");
	await VK.updates.start();
	console.log("Polling started");

	setInterval(tempUpdate, 5 * 60 * 1000);

	tempUpdate();
})();
