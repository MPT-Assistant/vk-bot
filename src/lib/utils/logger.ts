import { getRandomId } from "vk-io";
import { MessagesSendParams } from "vk-io/lib/api/schemas/params";
import vk from "../vk";

class Logger {
	public sendLog(text: string, params: MessagesSendParams = {}) {
		return vk.api.messages.send(
			Object.assign(
				{ message: text, chat_id: 1, random_id: getRandomId() },
				params,
			),
		);
	}
}

export default Logger;
