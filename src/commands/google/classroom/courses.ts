import { utils } from "rus-anonym-utils";
import { Keyboard } from "vk-io";
import { MPTMessage } from "../../../plugins/types";
import models from "../../../plugins/models";
import { classroomUser } from "../../../plugins/google/classroom";

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
			let userCourses = await classroomInstance.courses.list();
			if (!userCourses) {
				return message.sendMessage(`у Вас не найдено курсов.`);
			}
			const pagesBuilder = message.pageBuilder();
			pagesBuilder.setInfinityLoop(false);
			let pagesArray = [];
			let forwardData: any = {};
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
				pagesArray.push(
					Object.assign(
						{
							message: `Название: ${
								course.name
							}\nСоздан: ${utils.time.getDateTimeByMS(
								Number(new Date(course.creationTime || "")),
							)}\nОбновлён: ${utils.time.getDateTimeByMS(
								Number(new Date(course.updateTime || "")),
							)}\nСсылка на курс: ${course.alternateLink}\nStatus: ${
								course.courseState
							}`,
							dont_parse_link: 1,
						},
						forwardData,
					),
				);
			}
			pagesBuilder.setPages(pagesArray);
			const keyboard = pagesBuilder.keyboard;
			keyboard
				.textButton({
					label: "Кнопка с номером страницы",
					payload: {
						builder_id: pagesBuilder.id,
						builder_page: 2,
					},
				})
				.row()
				.textButton({
					label: "Кнопка с действием",
					payload: {
						builder_id: pagesBuilder.id,
						builder_action: "next",
					},
				});
			pagesBuilder.updateKeyboard(keyboard);
			pagesBuilder.build();

			return;
		}
	},
};
