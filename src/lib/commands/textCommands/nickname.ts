import TextCommand from "../../utils/TextCommand";

new TextCommand({
	alias: /^(?:ник)(?:\s(.*))$/i,
	process: (context) => {
		if (context.state.args[1].length > 25) {
			return context.state.sendMessage(`максимальная длина ника 25 символов.`);
		}
		context.state.user.nickname = context.state.args[1];
		return context.state.sendMessage(`Вы успешно сменили ник.`);
	},
});
