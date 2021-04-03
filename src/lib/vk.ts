import { ModernMessageContext } from "./../typings/message";
import { VK, Keyboard } from "vk-io";

import InternalUtils from "./utils/classes/utils";
import utils from "rus-anonym-utils";
import User from "./utils/classes/user";
import Chat from "./utils/classes/chat";

const vk = new VK({
	token: InternalUtils.config.vk.group.token,
	pollingGroupId: InternalUtils.config.vk.group.id,
});

vk.updates.on("chat_invite_user", async function messageHandler(context) {
	if (context.eventMemberId === -InternalUtils.config.vk.group.id) {
		context.send(
			`Всем привет!\nЧтобы бот полноценно работал в беседе, выдайте ему права администратора, либо право на чтение переписки.\nА также рекомендуем привязать беседу к своей группе.`,
			{
				keyboard: Keyboard.keyboard([
					[
						Keyboard.textButton({
							label: `Привязать группу`,
							payload: {
								command: `regchat`,
							},
							color: Keyboard.POSITIVE_COLOR,
						}),
					],
				]).inline(),
			},
		);
		InternalUtils.logger.sendLog(`Приглашён в беседу: ${context.chatId}`);
	}
});

vk.updates.on(
	"message",
	async function MessageHandler(context: ModernMessageContext) {
		if (context.messagePayload) {
			context.text = context.messagePayload.command;
		}
		if (
			context.isOutbox ||
			context.isGroup ||
			!context.text ||
			context.senderId !== 266982306
		) {
			return;
		}
		context.text = context.text
			.replace(/(\[club188434642\|[@a-z_A-ZА-Яа-я0-9]+\])/gi, ``)
			.replace(/(^\s*)|(\s*)$/g, "");

		const command = InternalUtils.textCommand.find((command) =>
			command.check(context.text as string),
		);

		if (!command) {
			if (context.isDM) {
				let possibleCommands = [];
				for (let tempTemplate of InternalUtils.textCommandsTemplates) {
					possibleCommands.push({
						template: tempTemplate,
						diff: utils.string.levenshtein(context.text, tempTemplate, {
							replaceCase: 0,
						}),
					});
				}
				possibleCommands.sort(function (a, b) {
					if (a.diff > b.diff) {
						return 1;
					}
					if (a.diff < b.diff) {
						return -1;
					}
					return 0;
				});
				const text = `\nВозможно вы имели в виду какую то из этих команд:\n1. ${possibleCommands[0].template}\n2. ${possibleCommands[1].template}\n3. ${possibleCommands[2].template}`;
				return await context.send(
					`Такой команды не существует, список команд можно посмотреть тут:\n${text}`,
					{ attachment: `article-188434642_189203_12d88f37969ae1c641` },
				);
			}
			return;
		}

		context.user = await new User(context.senderId).init();
		if (context.user.data?.ban === true) {
			return;
		}

		if (context.isChat) {
			context.chat = await new Chat(context.chatId as number).init();
		}

		context.sendMessage = async (text, params?) => {
			try {
				const paramsForSend = Object.assign(
					{
						disable_mentions: true,
						forward: JSON.stringify({
							peer_id: context.peerId,
							conversation_message_ids: context.conversationMessageId,
							is_reply: 1,
						}),
					},
					params,
				);
				return await context.send(
					`@id${context.user.id} (${context.user.data?.nickname}), ${text}`,
					paramsForSend,
				);
			} catch (error) {
				return error;
			}
		};

		context.args = context.text.match(command.regexp) as RegExpMatchArray;

		try {
			await command.process(context);
			await context.user.save();
			if (context.chat) {
				context.chat.save();
			}
			return;
		} catch (err) {
			console.log(err);
			await context.sendMessage(`ошиб очка.\n`);
			await context.send({
				sticker_id: utils.array.random([18464, 16588, 18466, 18484, 14088]),
			});
		}
	},
);

export default vk;
