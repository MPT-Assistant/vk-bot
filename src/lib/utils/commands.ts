import moment from "moment";

class CommandsUtils {
	public readonly DayTemplates: RegExp[] = [
		/воскресенье|вс/,
		/понедельник|пн/,
		/вторник|вт/,
		/среда|ср/,
		/четверг|чт/,
		/пятница|пт/,
		/суббота|сб/,
	];

	public getNextDate(text = ""): moment.Moment {
		let selectedDate: moment.Moment;
		if (text === "" || /(?:^сегодня|с)$/gi.test(text)) {
			selectedDate = moment();
		} else if (/(?:^завтра|^з)$/gi.test(text)) {
			selectedDate = moment().add(1, "day");
		} else if (/(?:^послезавтра|^пз)$/gi.test(text)) {
			selectedDate = moment().add(2, "day");
		} else if (/(?:^вчера|^в)$/gi.test(text)) {
			selectedDate = moment().subtract(1, "day");
		} else if (/(?:^позавчера|^поз)$/gi.test(text)) {
			selectedDate = moment().subtract(2, "day");
		} else if (/([\d]+)?(.)?([\d]+)?(.)?([\d]+)/.test(text)) {
			selectedDate = moment(text, "DD.MM.YYYY");
		} else {
			for (const templateIndex in this.DayTemplates) {
				const Regular_Expression = new RegExp(
					this.DayTemplates[templateIndex],
					`gi`,
				);
				if (Regular_Expression.test(text) === true) {
					const currentDate = new Date();
					const targetDay = Number(templateIndex);
					const targetDate = new Date();
					const delta = targetDay - currentDate.getDay();
					if (delta >= 0) {
						targetDate.setDate(currentDate.getDate() + delta);
					} else {
						targetDate.setDate(currentDate.getDate() + 7 + delta);
					}
					selectedDate = moment(targetDate);
				}
			}
		}

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
		return selectedDate as moment.Moment;
	}
}

export default new CommandsUtils();
