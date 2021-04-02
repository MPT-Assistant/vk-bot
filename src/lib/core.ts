import InternalUtils from "./utils/classes/utils";
import { Interval } from "simple-scheduler-task";
import "../commands/loader";
import vk from "./vk";

new Interval(async () => {
	await InternalUtils.mpt.getLastDump();
}, 30000);

vk.updates.startPolling().then(() => console.log("Polling started"));
