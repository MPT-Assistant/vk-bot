import TextCommand from "../../../lib/utils/classes/textCommand";

new TextCommand(/zz(\s(.*))?$/i, [], async (message) => {
	if (message.senderId !== 266982306) {
		return;
	}
	if (!message.args[1]) {
		return message.sendMessage(`нет аргумента`);
	}
	try {
		const v: string | number | JSON = await eval(message.args[1]);
		if (typeof v === "string") {
			return await message.send(`Результат: ${v}`);
		} else if (typeof v === "number") {
			return await message.send(`Значение: ${v}`);
		} else {
			return await message.send(
				`JSON Stringify: ${JSON.stringify(v, null, "　\t")}`,
			);
		}
	} catch (err) {
		return await message.send(`Ошибка: ${err.toString()}`);
	}
});
