import { MessageContext } from "vk-io";

import utils from ".";

class TextCommand {
	public regexp: RegExp;
	public templates: string[];
	public process: (message: MessageContext) => Promise<unknown>;

	constructor({
		regexpOrString,
		templates = [],
		process,
	}: {
		regexpOrString: RegExp | string;
		templates?: string[];
		process: (message: MessageContext) => Promise<unknown>;
	}) {
		if (typeof regexpOrString === "string") {
			regexpOrString = new RegExp(`^(?:${regexpOrString})$`, "i");
		}
		this.regexp = regexpOrString;
		this.templates = templates;
		this.process = process;

		utils.textCommands.push(this);
	}

	public check(input: string): boolean {
		return this.regexp.test(input);
	}
}

export default TextCommand;
