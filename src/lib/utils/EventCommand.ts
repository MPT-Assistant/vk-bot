import { MessageEventContext } from "vk-io";
import { GroupEventContextState } from "../../types/vk";

import utils from ".";

class EventCommand {
	public event: string;
	public process: (
		event: MessageEventContext<GroupEventContextState>,
	) => Promise<unknown>;

	constructor({
		event,
		process,
	}: {
		event: string;
		process: (
			event: MessageEventContext<GroupEventContextState>,
		) => Promise<unknown>;
	}) {
		this.event = event;
		this.process = process;
		utils.eventCommands.push(this);
	}
}

export default EventCommand;
