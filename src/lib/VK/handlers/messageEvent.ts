import { MessageEventContext } from "vk-io";
import { GroupEventContextState } from "../../../types/vk";

import internalUtils from "../../utils";

export default async function messageEventHandler(
	event: MessageEventContext<GroupEventContextState>,
) {
	if (!event.eventPayload || !event.eventPayload.type) {
		return;
	} else {
		const command = internalUtils.eventCommands.find(
			(x) => x.event === event.eventPayload.type,
		);

		if (!command) {
			return;
		} else {
			event.state.user = await internalUtils.getUserData(event.userId);
			if (event.state.user.ban === true) {
				return;
			}
			if (event.peerId > 2e9) {
				event.state.chat = await internalUtils.getChatData(event.peerId - 2e9);
			}
		}
		try {
			await command.process(event);
			await event.state.user.save();
			if (event.state.chat) {
				event.state.chat.save();
			}
			return;
		} catch (err) {
			return await event.answer({
				type: "show_snackbar",
				text: "Ошиб очка",
			});
		}
	}
}
