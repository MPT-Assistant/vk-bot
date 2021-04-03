import { ModernMessageContext } from "../../../typings/message";
import InternalUtils from "./utils";

class TextCommand {
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
		InternalUtils.textCommand.push(this);
		for (const template of templates) {
			InternalUtils.textCommandsTemplates.push(template);
		}
	}

	public check(input: string): boolean {
		return this.regexp.test(input);
	}
}

export default TextCommand;
