import { VK, getRandomId } from "vk-io";
import { MessagesSendParams } from "vk-io/lib/api/schemas/params";
import config from "../../DB/config.json";

class Logger {
	private vk = new VK({ token: config.vk.logger.token });
	public sendLog(text: string, params: MessagesSendParams = {}) {
		return this.vk.api.messages.send(
			Object.assign(
				{ message: text, chat_id: 1, random_id: getRandomId() },
				params,
			),
		);
	}
}

export default Logger;
