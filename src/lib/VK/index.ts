import { VK } from "vk-io";

import config from "../../DB/config.json";

import messageNewHandler from "./handlers/messageNew";
import messageEventHandler from "./handlers/messageEvent";

const vk = new VK({
	token: config.vk.group.token,
	pollingGroupId: config.vk.group.id,
});

vk.updates.on("message_new", messageNewHandler);
vk.updates.on("message_event", messageEventHandler);

export default vk;
