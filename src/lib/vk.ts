import { VK, Keyboard } from "vk-io";

import InternalUtils from "./utils/classes/utils";
import utils from "rus-anonym-utils";

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

vk.updates.on("message", async function (context) {
	if (context.messagePayload) {
		context.text = context.messagePayload.command;
	}
	if (context.isOutbox || context.isGroup || !context.text) {
		return;
	}
	context.text = context.text
		.replace(/(\[club188434642\|[@a-z_A-ZА-Яа-я0-9]+\])/gi, ``)
		.replace(/(^\s*)|(\s*)$/g, "");

	const command = InternalUtils.commands.find((command) =>
		command.check(context.text as string),
	);

	if (!command) {
		if (context.isDM) {
			let possibleCommands = [];
			for (let tempTemplate of InternalUtils.commandsTemplates) {
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

	context.user = await regUser(context.senderId);

	
});

async function regUser(id: number) {
	let data = await InternalUtils.Bot_DB.models.user.findOne({
		id: id,
	});
	if (!data) {
		const [user] = await vk.api.users.get({
			user_ids: id.toString(),
		});
		data = new InternalUtils.Bot_DB.models.user({
			id: id,
			nickname: user.first_name,
			ban: false,
			group: "",
			inform: false,
			reg_date: new Date(),
		});
		await InternalUtils.logger.sendLog(
			`Зарегистрирован новый пользователь\nUser: @id${id}`,
		);
	}
	return data;
}

vk.updates.startPolling().then(() => console.log("Polling started"));

export default vk;
