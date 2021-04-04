import { Keyboard } from "vk-io";
import EventCommand from "../../../lib/utils/classes/eventCommand";

import InternalUtils from "../../../lib/utils/classes/utils";
import vk from "../../../lib/vk";

new EventCommand("regChat", async function SetGroupEventCommand(event) {
	if (!event.chat) {
		return;
	}

	const selectedGroup = InternalUtils.mpt.data.groups.find(
		(group) =>
			group.name.toLowerCase() === event.eventPayload.group.toLowerCase(),
	);

	if (!selectedGroup) {
		return await event.answer({
			type: "show_snackbar",
			text: `Группы ${event.eventPayload.group} не найдено`,
		});
	} else {
		event.chat.data.group = selectedGroup.name;

		await event.answer({
			type: "show_snackbar",
			text: `Вы установили чату группу ${selectedGroup.name}.\n(${selectedGroup.specialty})`,
		});

		return await vk.api.messages.edit({
			peer_id: event.peerId,
			conversation_message_id: event.conversationMessageId,
			dont_parse_links: true,
			keyboard: Keyboard.builder(),
			keep_forward_messages: true,
			keep_snippets: true,
			message: `@id${event.user.id} (${event.user.data.nickname}) установил группу для чата по умолчанию\nГруппа: ${selectedGroup.name}\nСпециальность: (${selectedGroup.specialty})`,
		});
	}
});
