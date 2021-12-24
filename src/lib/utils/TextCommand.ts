import { MessageContext } from "vk-io";
import { GroupMessageContextState } from "../../types/vk";

import utils from ".";

class TextCommand {
	public regexp: RegExp;
	public templates: string[];
	public process: (
		message: MessageContext<GroupMessageContextState>,
	) => Promise<unknown>;

	constructor({
		alias,
		templates = [],
		process,
	}: {
		alias: RegExp | string;
		templates?: string[];
		process: (
			message: MessageContext<GroupMessageContextState>,
		) => Promise<unknown>;
	}) {
		if (typeof alias === "string") {
			alias = new RegExp(`^(?:${alias})$`, "i");
		}
		this.regexp = alias;
		this.templates = templates;
		this.process = process;

		utils.textCommands.push(this);
	}

	public check(input: string): boolean {
		return this.regexp.test(input);
	}
}

export default TextCommand;
