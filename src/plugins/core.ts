"use strict";
import { MPTCommand } from "./types";
import mongoose from "mongoose";
import { VK, MessageContext, IMessageContextSendOptions } from "vk-io";
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
const commands: Array<MPTCommand> = [];

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
vk.updates.use(async (message: MPTMessage) => {
	if (message.type !== `message` || message.senderId <= 0) return;
	message.user = await internal.regUserInBot(message.senderId);
	if (message.messagePayload && message.messagePayload) {
		let payload_data = message.messagePayload;
		message.text = payload_data.command;
	}
	if (message.isChat && message.chatId) {
		message.chat = await internal.regChatInBot(message.chatId);
	}
	if (!message.text) return;
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
	message.text = message.text
		.replace(/(\[club188434642\|[@a-z_A-ZА-Яа-я0-9]+\])/gi, ``)
		.replace(/(^\s*)|(\s*)$/g, "");

	let command = commands.find((x) => x.regexp.test(message.text || ""));
	if (!command) {
		if (!message.isChat) {
			return await message.send(
				`Такой команды не существует, список команд можно посмотреть тут:`,
				{ attachment: `article-188434642_189203_12d88f37969ae1c641` },
			);
		}
		return;
	}
	message.args = message.text.match(command.regexp);
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
		console.log(err);
		return;
	}
});

const internal = {
	regUserInBot: async (vk_id: any) => {
		let data = await models.user.findOne({ vk_id: vk_id });
		if (!data) {
			let [user] = await vk.api.users.get({ user_ids: vk_id });
			data = new models.user({
				id: await models.user.countDocuments(),
				vk_id: vk_id,
				ban: false,
				reg_date: new Date(),
				nickname: user.first_name,
				data: {
					unical_group_id: 0,
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
				unical_group_id: 0,
				inform: false,
			});
		}
		return data;
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
			commands.push({
				regexp: tempScript.regexp,
				process: tempScript.process,
			});
		}
	}
}

export { commandsLoader, vk, commands, mongoose, scheduler, mpt, config };
