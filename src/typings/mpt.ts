type Week = "Знаменатель" | "Числитель" | "Не определено";

interface Lesson {
	num: number;
	name: [string, string?];
	teacher: [string, string?];
}

interface Day {
	num: number;
	place: string;
	name: string;
	lessons: Lesson[];
}

interface Group {
	name: string;
	days: Day[];
}

interface Specialty {
	name: string;
	groups: Group[];
}

interface ParsedGroup {
	name: string;
	days: Day[];
}

interface ParsedSpecialty {
	name: string;
	groups: ParsedGroup[];
}

interface ParsedReplacement {
	num: number;
	old: {
		name: string;
		teacher: string;
	};
	new: {
		name: string;
		teacher: string;
	};
	updated: number;
}

interface ReplacementGroup {
	group: string;
	replacements: ParsedReplacement[];
}

type Replacement = {
	date: Date;
	group: string;
	detected: Date;
	addToSite: Date;
	lessonNum: number;
	oldLessonName: string;
	oldLessonTeacher: string;
	newLessonName: string;
	newLessonTeacher: string;
	hash: string;
};

interface MPT_Group {
	name: string;
	specialty: string;
}

interface MPT_Specialty {
	name: string;
	groups: Array<string>;
}

export { Specialty, Week, Replacement, MPT_Group, MPT_Specialty };
