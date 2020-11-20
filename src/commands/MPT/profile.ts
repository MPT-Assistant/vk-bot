import { Keyboard } from "vk-io";
import models from "../../plugins/models";
import { MPTMessage } from "../../plugins/types";
export = {
	regexp: /^(?:проф|профиль|profile)$/i,
	template: ["Проф", "Профиль", "Profile"],
	process: async (message: MPTMessage) => {
		let groupData: any = await models.utilityGroup.findOne({
			uid: message.user.data.unical_group_id,
		});
		let groupText = `Группа не установлена`;
		if (groupData) {
			groupText = `Привязан к группе: ${groupData.name}\nОтделение: ${groupData.specialty}`;
		}

		if (message.isChat) {
			return message.sendMessage(
				`Ваш профиль:
${groupText}`,
			);
		} else {
			return message.sendMessage(
				`Ваш профиль:
${groupText}`,
				{
					keyboard: Keyboard.keyboard([
						[
							Keyboard.textButton({
								label: `Google`,
								payload: {
									command: `Google`,
								},
								color: Keyboard.POSITIVE_COLOR,
							}),
						],
					]).inline(),
				},
			);
		}
	},
};
