import * as mpt from "./plugins/mpt";
import cryptoJS from "crypto-js";

console.log(`Start at ${new Date()}`);
(async function () {
	console.log(cryptoJS.MD5(`БИ50-2-19`).toString());
	console.log(cryptoJS.MD5(`БИ50-3-19`).toString());
})();
