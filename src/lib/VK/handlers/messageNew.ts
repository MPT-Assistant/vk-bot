import DB from "../../DB/index";

import { MessageContext } from "vk-io";

const mentionRegExp = new RegExp(
	`([club${DB.config.vk.group.id}|[@a-z_A-ZА-Яа-я0-9]+])`,
	"gi",
);

export default async function messageNewHandler(
	context: MessageContext,
): Promise<void> {
	if (context.isOutbox || context.isGroup || !context.text) {
		return;
	}

	context.text = context.text.replace(mentionRegExp, ``);
}
