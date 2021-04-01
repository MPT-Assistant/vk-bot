import { VK, Keyboard } from "vk-io";

import InternalUtils from "./utils";

const vk = new VK({
	token: InternalUtils.config.vk.group.token,
	pollingGroupId: InternalUtils.config.vk.group.id,
});

vk.updates.on("chat_invite_user", async function messageHandler(message) {
	if (message.eventMemberId === -InternalUtils.config.vk.group.id) {
		message.send(
			`Всем привет!\nЧтобы бот полноценно работал в беседе, выдайте ему права администратора, либо право на чтение переписки.\nА также рекомендуем привязать беседу к своей группе.`,
			{
				keyboard: Keyboard.keyboard([
					[
						Keyboard.textButton({
							label: `Привязать группу`,
							payload: {
								command: `regchat`,
							},
							color: Keyboard.POSITIVE_COLOR,
						}),
					],
				]).inline(),
			},
		);
		InternalUtils.logger.sendLog(`Приглашён в беседу: ${message.chatId}`);
	}
});

vk.updates.startPolling().then(() => console.log("Polling started"));

export default vk;
