import { Keyboard } from "vk-io";
import EventCommand from "../../../utils/EventCommand";
import DB from "../../../DB";
import VK from "../../../VK";

new EventCommand({
	event: "regChat",
	process: async (event) => {
		if (!event.state.chat) {
			return;
		}

		const selectedGroup = await DB.api.models.group.findOne({
			name: new RegExp(`^${event.eventPayload.group}$`, "i"),
		});

		if (!selectedGroup) {
			return await event.answer({
				type: "show_snackbar",
				text: `Группы ${event.eventPayload.group} не найдено`,
			});
		} else {
			event.state.chat.group = selectedGroup.name;

			await event.answer({
				type: "show_snackbar",
				text: `Вы установили чату группу ${selectedGroup.name}.\n(${selectedGroup.specialty})`,
			});

			return await VK.api.messages.edit({
				peer_id: event.peerId,
				conversation_message_id: event.conversationMessageId,
				dont_parse_links: true,
				keyboard: Keyboard.builder(),
				keep_forward_messages: true,
				keep_snippets: true,
				message: `@id${event.state.user.id} (${event.state.user.nickname}) установил группу для чата по умолчанию\nГруппа: ${selectedGroup.name}\nСпециальность: (${selectedGroup.specialty})`,
			});
		}
	},
});
