import TextCommand from "../../../lib/utils/classes/textCommand";

new TextCommand(
	/^(включить|отключить)(?:\sрассылку)$/i,
	["Отключить рассылку", "Включить рассылку"],
	async (message) => {
		const isEnable = message.args[1].toLowerCase() === "включить";
		if (message.chat) {
			message.chat.data.inform = isEnable;
			return await message.sendMessage(
				`рассылка замен ${isEnable ? "включена" : "отключена"}.`,
			);
		} else {
			message.user.data.inform = isEnable;
			return await message.sendMessage(
				`рассылка замен ${isEnable ? "включена" : "отключена"}.`,
			);
		}
	},
);
