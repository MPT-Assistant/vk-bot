import TextCommand from "../../../lib/utils/classes/textCommand";

new TextCommand(/ник(?:\s(.*))?$/i, ["Ник"], async (message) => {
	if (!message.args[1]) {
		return;
	}
	if (message.args[1].length > 25) {
		return message.sendMessage(`максимальная длина ника 25 символов.`);
	}
	message.user.data.nickname = message.args[1];
	return message.sendMessage(`Вы успешно сменили ник.`);
});
