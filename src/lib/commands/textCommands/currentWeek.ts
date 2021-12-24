import TextCommand from "../../utils/TextCommand";

import DB from "../../DB";

new TextCommand({
	alias: "чз",
	process: (context) => {
		return context.state.sendMessage(
			`Сейчас ${DB.api.info.isNumerator ? "числитель" : "знаменатель"}`,
		);
	},
});
