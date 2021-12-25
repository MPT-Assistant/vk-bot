import TextCommand from "../../../utils/TextCommand";

import DB from "../../../DB";

new TextCommand({
	alias: "чз",
	process: (context) => {
		let response = `сейчас ${
			DB.api.info.isNumerator ? "числитель" : "знаменатель"
		}\n\n`;

		if (new Date().getDay() === 0) {
			response += `Обратите внимание, что сегодня последний день текущей недели (воскресенье), а это значит, что уже завтра (понедельник) неделя будет иметь статус: ${
				DB.api.info.isNumerator ? "знаменатель" : "числитель"
			}.`;
		}

		return context.state.sendMessage(response);
	},
});
