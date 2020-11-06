import * as mpt from "./plugins/mpt";

console.log(`Start at ${new Date()}`);
(async function () {
	console.log((await mpt.mpt.parseAllSchedule())[0].groups[0]);
	process.exit();
})();
