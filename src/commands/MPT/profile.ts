import { Keyboard } from "vk-io";
import models from "../../plugins/models";
import { MPTMessage } from "../../plugins/types";
export = {
	regexp: /^(?:чат|chat)$/i,
	process: async (message: MPTMessage) => {
		let groupData: any = await models.utilityGroup.findOne({
			uid: message.user.data.unical_group_id,
		});
		let groupText = `Группа не установлена`;
		if (groupData) {
			groupText = `Привязан к группе: ${groupData.name}\nОтделение: ${groupData.specialty}`;
		}

		return message.sendMessage(
			`Ваш профиль:
${groupText}`,
		);
	},
};
