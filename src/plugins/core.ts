"use strict";
import { MPTCommand } from "./types";
import mongoose from "mongoose";
import VK_IO, { MessageContext } from "vk-io";
const { VK, Keyboard } = VK_IO;
import moment from "moment";
import scheduler from "simple-scheduler-task";
import temp_requester from "request-promise";
import parser from "cheerio";
import fs from "fs";
import os from "os";
moment.locale(`ru`);
import { QuestionManager } from "vk-io-question";
const questionManager = new QuestionManager();

import models from "./models";
import schemes from "./schemes";
import { MessagesSendParams } from "vk-io/lib/api/schemas/params";
import utils from "rus-anonym-utils";
const commands: Array<MPTCommand> = [];

const config: {
	token: string;
	groupID: number;
} = require(`../DB/config.json`);

const vk = new VK({
	token: config.token,
	apiMode: "parallel",
	apiVersion: "5.130",
	pollingGroupId: config.groupID,
});

vk.updates.use(questionManager.middleware);
vk.updates.use(async (message: MessageContext, next) => {
	if (message.type !== `message` || message.senderId <= 0) return;
	message.user = await internal.VK_reg_user_in_bot(message.senderId);
	if (message.messagePayload && message.messagePayload) {
		let payload_data = await JSON.parse(message.messagePayload);
		message.text = payload_data.command;
	}
	if (message.isChat && message.chatId) {
		message.chat = await internal.VK_reg_chat_in_bot(message.chatId);
	}
	if (!message.text) return;
	if (message.user.ban === true) return;
	message.send_message = async (text: string, params: MessagesSendParams) => {
		try {
			let params_for_send = await Object.assign(
				{ disable_mentions: true },
				params,
			);
			return await message.send(
				`@id${message.user.vk_id} (${message.user.nickname}), ${text}`,
				params_for_send,
			);
		} catch (error) {
			console.log(error);
			return;
		}
	};
	message.text = await message.text
		.replace(/(\[club188434642\|[@a-z_A-ZА-Яа-я0-9]+\])/gi, ``)
		.replace(/(^\s*)|(\s*)$/g, "");

	let command = await commands.find((x) => x.regexp.test(message.text || ""));
	if (!command) {
		return;
	}
	message.args = await message.text.match(command.regexp);
	try {
		await command.process(message);
		await message.user.save();
		if (message.chat) {
			message.chat.save();
		}
		return;
	} catch (err) {
		await message.send_message(`ошиб очка.`);
		await message.send({
			sticker_id: await utils.array.random([18464, 16588, 18466, 18484, 14088]),
		});
		console.log(err);
		return;
	}
});

const internal = {
	VK_reg_user_in_bot: async (vk_id: any) => {
		let data = await models.user.findOne({ vk_id: vk_id });
		if (!data) {
			let [user] = await vk.api.users.get({ user_ids: vk_id });
			data = await new models.user({
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
	VK_reg_chat_in_bot: async (chat_id: number) => {
		let data = await models.chat.findOne({ id: chat_id });
		if (!data) {
			data = await new models.chat({
				id: chat_id,
				unical_group_id: 0,
				inform: false,
			});
		}
		return data;
	},
};
