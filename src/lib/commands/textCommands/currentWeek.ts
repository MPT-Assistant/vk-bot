import TextCommand from "../../utils/TextCommand";

import DB from "../../DB";

new TextCommand({
	regexpOrString: "чз",
	process: (context) => {
		return context.send(`Сейчас ${DB.api.info.currentWeek}`);
	},
});
