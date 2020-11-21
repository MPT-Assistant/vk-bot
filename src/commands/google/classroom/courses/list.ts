import { utils } from "rus-anonym-utils";
import { Keyboard } from "vk-io";
import { MPTMessage } from "../../../../plugins/types";
import models from "../../../../plugins/models";

export = {
	regexp: /^(?:Мои курсы)$/i,
	template: ["Мои курсы"],
	process: async (message: MPTMessage) => {
		if (message.isChat) {
			return message.sendMessage(`команда доступна только в ЛС бота.`);
		} else {
			let userGoogleAccount = await models.userGoogle.findOne({
				vk_id: message.senderId,
			});
			if (!userGoogleAccount) {
				return message.sendMessage(
					`Вы ещё не привязали свой аккаунт Google к боту.`,
					{
						keyboard: Keyboard.keyboard([
							[
								Keyboard.textButton({
									label: "Привязать аккаунт",
									payload: {
										command: `Привязка`,
									},
									color: Keyboard.POSITIVE_COLOR,
								}),
							],
						]).inline(),
					},
				);
			}
			//@ts-ignore
			let classroomInstance = new classroomUser(userGoogleAccount.token);
			await message.sendMessage(`получаю список Ваших курсов...`);
			let userCourses = await classroomInstance.courses.list();
			if (!userCourses) {
				return message.sendMessage(`у Вас не найдено курсов.`);
			}
			const pagesBuilder = message.pageBuilder();
			let forwardData: {
				forward?: string;
				reply_to?: number;
			} = {};
			if (message.isChat) {
				forwardData.forward = JSON.stringify({
					peer_id: message.peerId,
					conversation_message_ids: message.conversationMessageId,
					is_reply: 1,
				});
			} else {
				forwardData.reply_to = message.id;
			}
			for (let course of userCourses) {
				const keyboard = pagesBuilder.keyboard.clone();
				keyboard
					.urlButton({
						url: course.alternateLink,
						label: "Открыть в Classroom",
					})
					.row()
					.textButton({
						label: "Объявления курса",
						payload: {
							command: `обьявления ${course.id}`,
						},
					})
					.row()
					.textButton({
						label: "Задания",
						payload: {
							command: `задания ${course.id}`,
						},
					})
					.row()
					.textButton({
						label: "Учителя",
						payload: {
							command: `учителя ${course.id}`,
						},
					});
				Keyboard.textButton({
					label: "",
				});
				pagesBuilder.addPages(
					Object.assign(
						{
							message: `Название: ${
								course.name
							}\nСоздан: ${utils.time.getDateTimeByMS(
								Number(new Date(course.creationTime || "")),
							)}\nОбновлён: ${utils.time.getDateTimeByMS(
								Number(new Date(course.updateTime || "")),
							)}`,
							dont_parse_links: 1,
							keyboard: keyboard,
						},
						forwardData,
					),
				);
			}
			pagesBuilder.build();
			return;
		}
	},
};
