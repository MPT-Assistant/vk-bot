import TextCommand from "../../../lib/utils/classes/textCommand";

new TextCommand(
	/^(?:изменения)(?:\s(включить|отключить))$/i,
	["Изменения включить", "Изменения отключить"],
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
