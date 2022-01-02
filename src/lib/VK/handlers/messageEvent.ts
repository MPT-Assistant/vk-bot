import { MessageEventContext } from "vk-io";
import { GroupEventContextState } from "../../../types/vk";

import internalUtils from "../../utils";

export default async function messageEventHandler(
	event: MessageEventContext<GroupEventContextState>,
) {
	if (!event.eventPayload || !event.eventPayload.type) {
		return;
	}

	const command = internalUtils.eventCommands.find(
		(x) => x.event === event.eventPayload.type,
	);

	if (!command) {
		return;
	}

	event.state = {
		user: await internalUtils.getUserData(event.userId),
		chat:
			event.peerId > 2e9
				? await internalUtils.getChatData(event.peerId - 2e9)
				: undefined,
	};

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
