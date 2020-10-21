import request from "request-promise";

export async function getAPIStatus(): Promise<
	Array<{
		section: string;
		performance: number;
		uptime: number;
	}>
> {
	let data = await request({
		uri: `https://vk.com/dev/health`,
		encoding: "latin1",
	});
	data = data.toString(`utf8`);
	let position1 = await data.indexOf(`var content = {`);
	let position2 = await data.indexOf(`'header': ['`);
	let newData = data.substring(position1, position2);
	position1 = newData.indexOf(`[[`);
	position2 = newData.indexOf(`]]`);
	let arrayWithSections = JSON.parse(
		newData.substring(position1, position2 + 2),
	);
	let outputArray = [];
	for (let i in arrayWithSections) {
		outputArray.push({
			section: arrayWithSections[i][0],
			performance: arrayWithSections[i][2],
			uptime: arrayWithSections[i][3],
		});
	}
	return outputArray;
}
