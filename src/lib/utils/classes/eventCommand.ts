import { ModernEventContext } from "./../../../typings/message";
import InternalUtils from "./utils";

class EventCommand {
	public event: string;
	public process: (event: ModernEventContext) => Promise<unknown>;

	constructor(
		event: string,
		process: (event: ModernEventContext) => Promise<unknown>,
	) {
		this.event = event;
		this.process = process;
		InternalUtils.eventCommand.push(this);
	}
}

export default EventCommand;
