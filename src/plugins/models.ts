"use strict";
import mongoose from "mongoose";

import schemes from "./schemes";
import * as types from "./types";

const user = mongoose.model<types.UserInterface>("user", schemes.user, `users`);
const chat = mongoose.model<types.ChatInterface>("chat", schemes.chat, `chats`);
const specialty = mongoose.model("specialty", schemes.specialty, `specialties`);
const replacement = mongoose.model(
	"replacement",
	schemes.replacement,
	`replacements`,
);
const utilityGroup = mongoose.model(
	"utility_group",
	schemes.utilityGroup,
	`groups`,
);
const userGoogle = mongoose.model("userGoogle", schemes.googleScheme, `google`);

user.mapReduce()

export = {
	user,
	chat,
	specialty,
	replacement,
	utilityGroup,
	userGoogle,
};
