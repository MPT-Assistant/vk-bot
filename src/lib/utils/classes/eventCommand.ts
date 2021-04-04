import { ModernEventContext } from "./../../../typings/message";
import InternalUtils from "./utils";

class EventCommand {
	public event: string;
	public process: (event: ModernEventContext) => Promise<any>;

	constructor(
		event: string,
		process: (event: ModernEventContext) => Promise<any>,
	) {
		this.event = event;
		this.process = process;
		InternalUtils.eventCommand.push(this);
	}
}

export default EventCommand;
