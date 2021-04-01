import { ModernMessageContext } from "./../typings/message";
import InternalUtils from "./utils";

class Command {
	public regexp: RegExp;
	public templates: string[];
	public process: (message: ModernMessageContext) => Promise<any>;

	constructor(
		regexp: RegExp,
		templates: string[],
		process: (message: ModernMessageContext) => Promise<any>,
	) {
		this.regexp = regexp;
		this.templates = templates;
		this.process = process;
		console.log("load");
		InternalUtils.commands.push(this);
	}

	public check(input: string): boolean {
		return this.regexp.test(input);
	}
}

export default Command;
