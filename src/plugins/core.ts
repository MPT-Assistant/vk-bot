"use strict";
import { MPTCommand } from "./types";
import mongoose from "mongoose";
import {
	VK,
	MessageContext,
	IMessageContextSendOptions,
	Keyboard,
	getRandomId,
} from "vk-io";
import { MPTMessage } from "./types";
import moment from "moment";
import scheduler from "simple-scheduler-task";
import fs from "fs";
moment.locale(`ru`);
import { QuestionManager } from "vk-io-question";
const questionManager = new QuestionManager();
import { mpt } from "./mpt";

import models from "./models";
import utils from "rus-anonym-utils";
import { MessagesSendParams } from "vk-io/lib/api/schemas/params";
const commands: Array<MPTCommand> = [];
const commandsTemplates: Array<string> = [];

const config: {
	token: string;
	groupID: number;
	mongo: string;
} = require(`../DB/config.json`);

const vk = new VK({
	token: config.token,
	apiMode: "parallel",
	apiVersion: "5.130",
	pollingGroupId: config.groupID,
});

vk.updates.use(questionManager.middleware);

vk.updates.on("chat_invite_user", async function (message: MessageContext) {
	message.send(
		`Всем привет!\nЧтобы бот полноценно работал в беседе, выдайте ему права администратора, либо право на чтение переписки.`,
		{
			keyboard: Keyboard.keyboard([
				[
					Keyboard.textButton({
						label: `Зарегистрировать чат`,
						payload: {
							command: `regchat`,
						},
						color: Keyboard.POSITIVE_COLOR,
					}),
				],
			]).inline(),
		},
	);
});

vk.updates.on("message", async function (message: MPTMessage) {
	if (message.isGroup || message.isOutbox) {
		return;
	}
	message.user = await internal.regUserInBot(message);
	if (message.messagePayload && message.messagePayload) {
		let payload_data = message.messagePayload;
		message.text = payload_data.command;
	}
	if (message.isChat && message.chatId) {
		message.chat = await internal.regChatInBot(message.chatId);
	}
	if (!message.text) return;
	message.text = message.text
		.replace(/(\[club188434642\|[@a-z_A-ZА-Яа-я0-9]+\])/gi, ``)
		.replace(/(^\s*)|(\s*)$/g, "");

	let selectedRegExp: RegExp;
	let command = commands.find((x) =>
		x.regexp.find((y) => {
			if (y.test(message.text || "") === true) {
				selectedRegExp = y;
				return y;
			}
		}),
	);
	if (!command) {
		if (!message.isChat) {
			let possibleCommands = [];
			for (let tempTemplate of commandsTemplates) {
				possibleCommands.push({
					template: tempTemplate,
					diff: await utils.string.levenshtein(message.text, tempTemplate),
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
			let text = `\nВозможно вы имели в виду какую то из этих команд:\n1. ${possibleCommands[0].template}\n2. ${possibleCommands[1].template}\n3. ${possibleCommands[2].template}`;
			return await message.send(
				`Такой команды не существует, список команд можно посмотреть тут:\n${text}`,
				{ attachment: `article-188434642_189203_12d88f37969ae1c641` },
			);
		}
		return;
	}
	if (message.user.ban === true) return;
	message.sendMessage = async (
		text: string | IMessageContextSendOptions,
		params?: IMessageContextSendOptions | undefined,
	): Promise<MessageContext<Record<string, any>>> => {
		try {
			let paramsForSend = Object.assign(
				{
					disable_mentions: true,
					forward: JSON.stringify({
						peer_id: message.peerId,
						conversation_message_ids: message.conversationMessageId,
						is_reply: 1,
					}),
				},
				params,
			);
			return await message.send(
				`@id${message.user.vk_id} (${message.user.nickname}), ${text}`,
				paramsForSend,
			);
		} catch (error) {
			console.log(error);
			return error;
		}
	};
	//@ts-ignore
	message.args = message.text.match(selectedRegExp);
	try {
		await command.process(message);
		await message.user.save();
		if (message.chat) {
			message.chat.save();
		}
		return;
	} catch (err) {
		await message.sendMessage(`ошиб очка.`);
		await message.send({
			sticker_id: await utils.array.random([18464, 16588, 18466, 18484, 14088]),
		});
		let errorInDocument = await vk.upload.messageDocument({
			peer_id: message.peerId,
			source: {
				values: {
					value: Buffer.from(await internal.errorGetData(err)),
					filename: `output.txt`,
					contentType: `text/plain`,
				},
			},
		});
		let forwardData: any = {};
		if (message.isChat) {
			forwardData.forward = JSON.stringify({
				peer_id: message.peerId,
				conversation_message_ids: message.conversationMessageId,
				is_reply: 1,
			});
		} else {
			forwardData.reply_to = message.id;
		}
		return await vk.api.messages.send(
			Object.assign(
				<MessagesSendParams>{
					message: `@id266982306 (rus_anonym), Обнаружена новая ошибка:\nUser: @id${
						message.senderId
					}${
						message.isChat ? `\nChat: ${message.chatId}` : ""
					}\nMessage Date: ${new Date(
						message.createdAt * 1000,
					)}\nProcessed: ${new Date()}`,
					random_id: getRandomId(),
					chat_id: 1,
					attachment: errorInDocument.toString(),
				},
				forwardData,
			),
		);
	}
});

const internal = {
	regUserInBot: async (message: MPTMessage) => {
		let data = await models.user.findOne({ vk_id: message.senderId });
		if (!data) {
			let [user] = await vk.api.users.get({
				user_ids: message.senderId.toString(),
			});
			data = new models.user({
				id: await models.user.countDocuments(),
				vk_id: message.senderId,
				ban: false,
				reg_date: new Date(),
				nickname: user.first_name,
				data: {
					unical_group_id: "",
					lesson_notices: true,
					replacement_notices: true,
					mailing: true,
				},
			});
		}
		return data;
	},
	regChatInBot: async (chat_id: number) => {
		let data = await models.chat.findOne({ id: chat_id });
		if (!data) {
			data = new models.chat({
				id: chat_id,
				unical_group_id: "",
				inform: false,
				mailing: true,
			});
		}
		return data;
	},
	errorGetData: async (error: Error): Promise<string> => {
		return `Error ${utils.time.currentDateTime()}\n\n\n\nScript uptime: ${process.uptime()}sec\n\n\n\nError Name: ${
			error.name
		}\nError Message: ${error.message}\n\nError Stack: ${error.stack}`;
	},
};

async function commandsLoader(path: string) {
	let arrayWithCommands = fs.readdirSync(path);
	for (let i in arrayWithCommands) {
		let currentElement = `${path}/${arrayWithCommands[i]}`;
		if (fs.statSync(currentElement).isDirectory()) {
			await commandsLoader(currentElement);
		} else {
			let tempScript = require(`.` + currentElement);
			for (let template of tempScript.template) {
				commandsTemplates.push(template);
			}
			commands.push({
				regexp: tempScript.regexp,
				process: tempScript.process,
			});
		}
	}
}

export { commandsLoader, vk, commands, mongoose, scheduler, mpt, config };
