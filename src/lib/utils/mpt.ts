import utils from "../utils";

export default class MPT {
	public async getLastDump() {
		const data = await utils.DB.models.dumpModel.findOne({});
		if (data) {
			return data.data;
		} else {
			throw new Error("Dump not found");
		}
	}
}
