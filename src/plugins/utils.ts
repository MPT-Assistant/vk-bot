import CryptoJS from "crypto-js";

const hash = {
	md5: (input: string): string => {
		return CryptoJS.MD5(input).toString();
	},
};

export { hash };
