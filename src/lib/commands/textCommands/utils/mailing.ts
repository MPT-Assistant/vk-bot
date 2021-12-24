import TextCommand from "../../../utils/TextCommand";

new TextCommand({
	alias: /^(?:изменения)(?:\s(включить|отключить))$/i,
	process: (message) => {
		const isEnable = message.state.args[1].toLowerCase() === "включить";
		if (message.state.chat) {
			message.state.chat.inform = isEnable;
			return message.state.sendMessage(
				`рассылка замен ${isEnable ? "включена" : "отключена"}.`,
			);
		} else {
			message.state.user.inform = isEnable;
			return message.state.sendMessage(
				`рассылка замен ${isEnable ? "включена" : "отключена"}.`,
			);
		}
	},
});
