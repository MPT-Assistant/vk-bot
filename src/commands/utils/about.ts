import utils from "rus-anonym-utils";

import InternalUtils from "../../lib/utils/classes/utils";
import Command from "../../lib/utils/classes/command";

new Command(
	/^(?:Stats|About|Bot)$/i,
	["Stats", "About", "Bot"],
	async (message) => {
		const API = await utils.vk.api.status();
		let output = `Bot work already ${process.uptime()} sec\n`;
		output += `Users: ${await InternalUtils.Bot_DB.models.user.count()}\n`;
		output += `Chats: ${await InternalUtils.Bot_DB.models.chat.count()}\n`;
		output += `Replacements: ${await InternalUtils.API_DB.models.replacement.count()}\n`;
		output += `Specialties: ${await InternalUtils.API_DB.models.specialty.count()}\n`;
		output += `Groups: ${await InternalUtils.API_DB.models.group.count()}\n\n`;

		output += `VK API Status:\n`;
		for (let i in API) {
			output += `${Number(i) + 1}. ${API[i].section} [${
				API[i].performance
			}ms] - ${API[i].uptime}%\n`;
		}
		return message.sendMessage(`:\n${output}`);
	},
);
