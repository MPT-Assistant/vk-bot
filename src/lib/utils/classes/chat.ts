import InternalUtils from "../classes/utils";
import { ChatSchema } from "../DB/schemes";
import { ExtractDoc } from "ts-mongoose";

export default class Chat {
	public id: number;
	public data: ExtractDoc<typeof ChatSchema> | undefined;

	constructor(id: number) {
		this.id = id;
	}

	public async init() {
		let data = await InternalUtils.Bot_DB.models.chat.findOne({
			id: this.id,
		});
		if (!data) {
			data = new InternalUtils.Bot_DB.models.chat({
				id: this.id,
				group: "",
				inform: false,
			});
			InternalUtils.logger.sendLog(
				`Зарегистрирован новый чат\nChat: #${this.id}`,
			);
		}
		this.data = data;
		return this;
	}

	public async save() {
		if (this.data) {
			await this.data.save();
		} else {
			throw new Error("Chat not init");
		}
	}
}
