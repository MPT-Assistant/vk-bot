import { ExtractDoc } from "ts-mongoose";

import DB from "../DB";
import VK from "../VK";

import TextCommand from "./TextCommand";

class Utils {
	public textCommands: TextCommand[] = [];

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
}

export default new Utils();
