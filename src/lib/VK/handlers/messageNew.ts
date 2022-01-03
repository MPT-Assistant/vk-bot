import DB from "../../DB/index";
import internalUtils from "../../utils";

import { MessageContext } from "vk-io";
import { GroupMessageContextState } from "../../../types/vk";

const mentionRegExp = new RegExp(
	`([club${DB.config.vk.group.id}|[@a-z_A-ZА-Яа-я0-9]+])`,
	"gi",
);

export default async function messageNewHandler(
	context: MessageContext<GroupMessageContextState>,
): Promise<void> {
	if (context.isOutbox || context.isGroup || !context.text) {
		return;
	}

	context.text = context.text.replace(mentionRegExp, ``);

	if (context.hasMessagePayload && context.messagePayload.cmd) {
		context.text = context.messagePayload.cmd;
	}

	const command = internalUtils.textCommands.find((x) =>
		x.check(context.text as string),
	);

	if (command) {
		context.state = {
			args: command.regexp.exec(context.text as string) as RegExpExecArray,
			user: await internalUtils.getUserData(context.senderId),
			chat: context.isChat
				? await internalUtils.getChatData(context.chatId as number)
				: undefined,
			sendMessage: async (text, params) => {
				if (typeof text !== "string" && text.message !== undefined) {
					text.message =
						`@id${context.senderId}  (${context.state.user.nickname}), ` +
						text.message;
				}
				const paramsForSend = Object.assign(
					{
						disable_mentions: true,
						forward: JSON.stringify({
							peer_id: context.peerId,
							conversation_message_ids: context.conversationMessageId,
							is_reply: 1,
						}),
					},
					typeof text === "string" ? params || {} : text,
				);
				if (typeof text === "string") {
					return await context.send(
						`@id${context.senderId} (${context.state.user.nickname}), ` + text,
						paramsForSend,
					);
				} else {
					return await context.send(paramsForSend);
				}
			},
		};
		await command.process(context);
		await context.state.user.save();
		if (context.state.chat) {
			await context.state.chat.save();
		}
	} else if (!context.isChat) {
		await context.reply({
			message: "Такой команды не существует\nСписок команд:",
			attachment: `article-188434642_189203_12d88f37969ae1c641`,
		});
	}
}
