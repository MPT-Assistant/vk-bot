import EventCommand from "../../../lib/utils/classes/eventCommand";

new EventCommand("setGroup", async function SetGroupEventCommand(event) {
	console.log(event);
});
