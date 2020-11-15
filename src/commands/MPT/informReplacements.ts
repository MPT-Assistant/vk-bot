import { MPTMessage } from "../../plugins/types";
import { Keyboard } from "vk-io";
export = {
	regexp: /^(?:изменения)\s(вкл|выкл|выключить|включить)$/i,
	template: [],
	process: async (message: MPTMessage) => {
		if (/вкл|включить/gi.test(message.args[1]) === true) {
			message.chat
				? (message.chat.inform = true)
				: (message.user.data.replacement_notices = true);
			return await message.sendMessage(
				`рассылка изменений в расписании группы включена!`,
				{
					keyboard: Keyboard.keyboard([
						[
							Keyboard.textButton({
								label: `Выключить рассылку изменений`,
								payload: {
									command: `изменения выкл`,
								},
								color: Keyboard.NEGATIVE_COLOR,
							}),
						],
					]).inline(),
				},
			);
		}

		if (/выкл|выключить/gi.test(message.args[1]) === true) {
			message.chat
				? (message.chat.inform = false)
				: (message.user.data.replacement_notices = false);
			return await message.sendMessage(
				`рассылка изменений в расписании группы отключена!`,
				{
					keyboard: Keyboard.keyboard([
						[
							Keyboard.textButton({
								label: `Включить рассылку изменений`,
								payload: {
									command: `изменения вкл`,
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
