import { VK } from "vk-io";

import InternalUtils from "./utils";

const vk = new VK({
	token: InternalUtils.config.vk.group.token,
	pollingGroupId: InternalUtils.config.vk.group.id,
});

vk.updates.on("message_new", async function messageHandler(message) {});

vk.updates.startPolling().then(() => console.log("Polling started"));
