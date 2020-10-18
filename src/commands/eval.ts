import { MessageContext } from "vk-io";
export = {
	regexp: /^(?:zz)\s([^]+)$/i,
	process: async (message: MessageContext) => {
		if (message.senderId !== 266982306) {
			return;
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
	},
};
