import { VK } from "vk-io";

import config from "../../DB/config.json";

import messageNewHandler from "./handlers/messageNew";

const vk = new VK({
	token: config.vk.group.token,
	pollingGroupId: config.vk.group.id,
});

vk.updates.on("message_new", messageNewHandler);

export default vk;
