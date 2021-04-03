import InternalUtils from "./utils/classes/utils";
import { Interval } from "simple-scheduler-task";
import "../commands/textCommands/loader";
import vk from "./vk";

new Interval(async () => {
	await InternalUtils.mpt.getLastDump();
}, 30000);

InternalUtils.API_DB.connection.once("open", connectDB_Handler);

InternalUtils.Bot_DB.connection.once("open", connectDB_Handler);

function connectDB_Handler() {
	if (
		InternalUtils.API_DB.connection.readyState === 1 &&
		InternalUtils.Bot_DB.connection.readyState === 1
	) {
		InternalUtils.mpt.getLastDump();
		vk.updates
			.startPolling()
			.then(() => console.log("Polling started at ", new Date()));
	}
}
