import utils from "rus-anonym-utils";

import InternalUtils from "../../lib/utils/classes/utils";
import Command from "../../lib/utils/classes/command";

new Command(
	/^(?:помощь|help|start|команды)$/i,
	["Помощь", "Команды"],
	async (message) => {
		const API = await utils.vk.api.status();
		let output = `Bot work already ${process.uptime()} sec\n`;
		output += `Users: ${await InternalUtils.Bot_DB.models.user.count()}`;
		output += `Chats: ${await InternalUtils.Bot_DB.models.chat.count()}`;
		output += `Replacements: ${await InternalUtils.API_DB.models.replacement.count()}`;
		output += `Specialties: ${await InternalUtils.API_DB.models.specialty.count()}`;
		output += `Groups: ${await InternalUtils.API_DB.models.group.count()}`;

		output += `VK API Status:\n`;
		for (let i in API) {
			output += `${Number(i) + 1}. ${API[i].section} [${
				API[i].performance
			}ms] - ${API[i].uptime}%\n`;
		}
		return message.sendMessage(`:\n${output}`);
	},
);
