import { getAPIStatus } from "../plugins/vk";

import { MPTMessage } from "../plugins/types";
export = {
	regexp: /^(?:stats|about|bot)$/i,
	process: async (message: MPTMessage) => {
		let VKAPI = await getAPIStatus();
		let output = ``;
		for (let i in VKAPI) {
			output += `${Number(i) + 1}. ${VKAPI[i].section} [${
				VKAPI[i].performance
			}ms] - ${VKAPI[i].uptime}%\n`;
		}
		return message.sendMessage(`:\n${output}`);
	},
};
