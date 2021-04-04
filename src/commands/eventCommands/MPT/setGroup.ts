import EventCommand from "../../../lib/utils/classes/eventCommand";

import InternalUtils from "../../../lib/utils/classes/utils";

new EventCommand("setGroup", async function SetGroupEventCommand(event) {
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
		event.user.data.group = selectedGroup.name;
		return await event.answer({
			type: "show_snackbar",
			text: `Вы установили себе группу ${selectedGroup.name}.\n(${selectedGroup.specialty})`,
		});
	}
});
