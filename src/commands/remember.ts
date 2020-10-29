import { MPTMessage } from "../plugins/types";
import { resolveResource } from "vk-io";
import { createCanvas, loadImage } from "canvas";
import { registerFont } from "canvas";
import { vk } from "../plugins/core";
import utils from "rus-anonym-utils";

process.env.FONTCONFIG_PATH = "./DB/templates/fonts";

registerFont(`./DB/templates/fonts/Roboto-Regular.ttf`, { family: `Roboto` });

export = {
	regexp: /^(?:помянем)\s?([^]+)?/i,
	process: async (message: MPTMessage) => {
		if (
			!message.args[1] &&
			!message.replyMessage &&
			message.forwards.length !== 1
		) {
			return message.sendMessage(
				`отправьте ссылку на человека или перешлите сообщение`,
			);
		}

		let user: any;

		if (!message.args[1] && (message.replyMessage || message.forwards[0])) {
			user = message.replyMessage?.senderId || message.forwards[0].senderId;
		} else {
			try {
				let data = await resolveResource({
					resource: message.args[1],
					api: vk.api,
				});
				user = data.id;
			} catch (error) {
				return message.sendMessage(`отправьте валидную ссылку на человека.`);
			}
		}

		if (user < 0) {
			return message.sendMessage(`отправьте валидную ссылку на человека.`);
		}

		message.send(
			`Подождите секундочку...\nВозможно это займёт несколько минут...`,
		);
		let [user_info]: any = await vk.api.users.get({
			user_ids: user,
			fields: ["photo_max_orig", "bdate", "screen_name"],
			name_case: "nom",
		});
		async function callback(data: any, message: MPTMessage) {
			let send_data = data;

			function parse_date(date: any) {
				if (!date) return `??.??.????`;
				let new_date = date.split(`.`);
				if (new_date[0] < 10) new_date[0] = `0${new_date[0]}`;
				if (new_date[1] < 10) new_date[1] = `0${new_date[1]}`;
				if (new_date[2] < 10) new_date[2] = `0${new_date[2]}`;
				if (!new_date[0]) new_date[0] = `??`;
				if (!new_date[1]) new_date[1] = `??`;
				if (!new_date[2]) new_date[2] = `????`;
				return new_date.join(`.`);
			}
			const parse_bdate = await parse_date(user_info.bdate);
			const die_user_image = await loadImage(user_info.photo_max_orig);

			function gray(imgObj: any) {
				let imgW = imgObj.width;
				let imgH = imgObj.height;
				let temp_canvas = createCanvas(imgW, imgH);
				var canvasContext = temp_canvas.getContext("2d");
				canvasContext.drawImage(imgObj, 0, 0);
				var imgPixels = canvasContext.getImageData(0, 0, imgW, imgH);
				for (var y = 0; y < imgPixels.height; y++) {
					for (var x = 0; x < imgPixels.width; x++) {
						var i = y * 4 * imgPixels.width + x * 4;
						var avg =
							(imgPixels.data[i] +
								imgPixels.data[i + 1] +
								imgPixels.data[i + 2]) /
							3;
						imgPixels.data[i] = avg;
						imgPixels.data[i + 1] = avg;
						imgPixels.data[i + 2] = avg;
					}
				}
				canvasContext.putImageData(
					imgPixels,
					0,
					0,
					0,
					0,
					imgPixels.width,
					imgPixels.height,
				);
				return temp_canvas.toBuffer();
			}
			const new_die_user_image = await loadImage(
				await gray(die_user_image),
			).then((image) => {
				const canvas = createCanvas(image.width, image.height);
				const ctx = canvas.getContext("2d");
				canvas.height = image.height;
				canvas.width = image.width;
				ctx.beginPath();
				ctx.arc(350 / 2, 350 / 2, 350 / 2, 0, Math.PI * 2, true);
				ctx.closePath();
				ctx.fill();
				ctx.globalCompositeOperation = "source-in";
				ctx.drawImage(image, 0, 0, 350, 350);
				return canvas;
			});
			const canvas = createCanvas(1303, 1041);
			const ctx = canvas.getContext("2d");
			await loadImage(send_data).then(async (image) => {
				ctx.drawImage(image, 0, 0);
				ctx.drawImage(new_die_user_image, 476, 110);
				ctx.font = "50px Roboto";
				ctx.textAlign = `center`;
				ctx.fillText(
					`${user_info.first_name} ${user_info.last_name}`,
					651,
					631,
				);
				ctx.fillText(`@${user_info.screen_name}`, 651, 691);
				ctx.fillText(
					`${parse_bdate} - ${await utils.time.currentDate()}`,
					651,
					750,
				);
				let new_send_data = canvas.toBuffer();
				return await message.sendPhotos({ value: new_send_data });
			});
		}
		return await callback(
			require(`fs`).readFileSync(`./DB/templates/photos/ledger.png`),
			message,
		);
	},
};
