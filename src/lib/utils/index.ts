import { ExtractDoc } from "ts-mongoose";

import DB from "../DB";
import VK from "../VK";

import TextCommand from "./TextCommand";

import mpt from "./mpt";

class Utils {
	public readonly textCommands: TextCommand[] = [];

	public mpt = mpt;

	public async getUserData(
		id: number,
	): Promise<ExtractDoc<typeof DB.bot.schemes.userSchema>> {
		const userData = await DB.bot.models.user.findOne({
			id,
		});
		if (!userData) {
			const [VK_USER_DATA] = await VK.api.users.get({
				user_id: id,
			});
			const newUserData = new DB.bot.models.user({
				id,
				nickname: VK_USER_DATA.first_name,
				group: "",
				ban: false,
				inform: false,
				regDate: new Date(),
				reportedReplacements: [],
			});
			await newUserData.save();
			return newUserData;
		}
		return userData;
	}

	public async getChatData(
		id: number,
	): Promise<ExtractDoc<typeof DB.bot.schemes.chatSchema>> {
		const chatData = await DB.bot.models.chat.findOne({
			id,
		});
		if (!chatData) {
			const newChatData = new DB.bot.models.chat({
				id,
				group: "",
				inform: false,
				reportedReplacements: [],
			});
			await newChatData.save();
			return newChatData;
		}
		return chatData;
	}
}

export default new Utils();
