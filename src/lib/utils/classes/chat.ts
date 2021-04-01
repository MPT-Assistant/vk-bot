import InternalUtils from "../classes/utils";
import { ChatSchema } from "../DB/schemes";
import vk from "../../vk";
import { ExtractDoc } from "ts-mongoose";

export default class Chat {
	public id: number;
	public data: ExtractDoc<typeof ChatSchema> | undefined;

	constructor(id: number) {
		this.id = id;
	}

	public async init() {
		let data = await InternalUtils.Bot_DB.models.user.findOne({
			id: this.id,
		});
		if (!data) {
			const [user] = await vk.api.users.get({
				user_ids: this.id.toString(),
			});
			data = new InternalUtils.Bot_DB.models.user({
				id: this.id,
				nickname: user.first_name,
				ban: false,
				group: "",
				inform: false,
				reg_date: new Date(),
			});
			InternalUtils.logger.sendLog(
				`Зарегистрирован новый пользователь\nUser: @id${this.id}`,
			);
		}
		this.data = data;
		return this;
	}

	public async save() {
		if (this.data) {
			await this.data.save();
		} else {
			throw new Error("User not init");
		}
	}
}
