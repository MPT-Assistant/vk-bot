import Command from "../../../lib/utils/classes/command";

new Command(/ник(\s(.*))?$/i, ["Ник"], async (message) => {
	if (message.args[1].length > 25) {
		return message.sendMessage(`максимальная длина ника 25 символов.`);
	}
	message.user.data.nickname = message.args[1];
	return message.sendMessage(`Вы успешно сменили ник.`);
});
