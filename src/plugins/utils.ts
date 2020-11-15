import { getRandomId } from "vk-io";
import { MessagesSendParams } from "vk-io/lib/api/schemas/params";
import * as core from "./core";
import CryptoJS from "crypto-js";

const hash = {
	md5: (input: string): string => {
		return CryptoJS.MD5(input).toString();
	},
};

async function getUpperLetter(str: string) {
	let array_with_str = str.split(``);
	let data = `ЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮ`.split(``);
	let temp_array = [];
	for (let i in array_with_str) {
		for (let j in data) {
			if (array_with_str[i].indexOf(data[j]) != -1) {
				temp_array.push({
					letter: array_with_str[i],
					index: i,
				});
			}
		}
	}
	return temp_array;
}

async function sendLog(text: string, params?: MessagesSendParams) {
	return await core.vk.api.messages.send(
		Object.assign(
			{ message: text, chat_id: 1, random_id: getRandomId() },
			params || {},
		),
	);
}

export { hash, getUpperLetter, sendLog };
