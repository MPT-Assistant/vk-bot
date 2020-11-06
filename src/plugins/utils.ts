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

export { hash, getUpperLetter };
