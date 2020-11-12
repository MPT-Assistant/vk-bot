import utils from "rus-anonym-utils";
import { MPTMessage } from "../../plugins/types";
export = {
	regexp: [/^(?:stats|about|bot)$/i],
	template: ["stats", "about", "bot"],
	process: async (message: MPTMessage) => {
		let VKAPI = await utils.vk.api.status();
		let output = ``;
		output += `Bot work already ${process.uptime()} sec\n`;
		output += `VK API: `;
		for (let i in VKAPI) {
			output += `${Number(i) + 1}. ${VKAPI[i].section} [${
				VKAPI[i].performance
			}ms] - ${VKAPI[i].uptime}%\n`;
		}
		return message.sendMessage(`:\n${output}`);
	},
};
