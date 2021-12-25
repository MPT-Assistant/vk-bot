import EventCommand from "../../../utils/EventCommand";
import DB from "../../../DB";

new EventCommand({
	event: "setGroup",
	process: async function SetGroupEventCommand(event) {
		const selectedGroup = await DB.api.models.group.findOne({
			name: new RegExp(`^${event.eventPayload.group}$`, "i"),
		});

		if (!selectedGroup) {
			return await event.answer({
				type: "show_snackbar",
				text: `Группы ${event.eventPayload.group} не найдено`,
			});
		} else {
			event.user.data.group = selectedGroup.name;
			return await event.answer({
				type: "show_snackbar",
				text: `Вы установили себе группу ${selectedGroup.name}.\n(${selectedGroup.specialty})`,
			});
		}
	},
});
