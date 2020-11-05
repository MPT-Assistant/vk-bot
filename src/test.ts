import * as mpt from "./plugins/mpt";

(async function () {
	console.log(await mpt.mpt.parseTimetable());
})();
