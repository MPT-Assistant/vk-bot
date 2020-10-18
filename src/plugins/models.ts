"use strict";
import mongoose from "mongoose";

import schemes from "./schemes";

const user = mongoose.model("user", schemes.user, `users`);
const chat = mongoose.model("chat", schemes.chat, `chats`);
const specialty = mongoose.model("specialty", schemes.specialty, `specialties`);
const replacement = mongoose.model(
	"replacement",
	schemes.replacement,
	`replacements`,
);
const utility_group = mongoose.model(
	"utility_group",
	schemes.utility_group,
	`groups`,
);

export = {
	user,
	chat,
	specialty,
	replacement,
	utility_group,
};
