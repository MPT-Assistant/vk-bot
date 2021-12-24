import VK from "./VK";

(async function () {
	VK.updates.start().then(() => console.log("Started"));
})();
