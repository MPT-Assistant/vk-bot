import { ModernMessageContext } from "../../../typings/message";
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
		InternalUtils.commands.push(this);
		for (const template of templates) {
			InternalUtils.commandsTemplates.push(template);
		}
	}

	public check(input: string): boolean {
		return this.regexp.test(input);
	}
}

export default Command;
