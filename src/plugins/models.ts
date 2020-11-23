"use strict";
import mongoose from "mongoose";
import { typedModel, ExtractDoc } from "ts-mongoose";

import schemes from "./schemes";

const user = typedModel("user", schemes.user, `users`);
const chat = typedModel("chat", schemes.chat, `chats`);
const specialty = typedModel("specialty", schemes.specialty, `specialties`);
const replacement = typedModel(
	"replacement",
	schemes.replacement,
	`replacements`,
);
const utilityGroup = typedModel(
	"utility_group",
	schemes.utilityGroup,
	`groups`,
);
const userGoogle = typedModel("userGoogle", schemes.googleScheme, `google`);


export = {
	user,
	chat,
	specialty,
	replacement,
	utilityGroup,
	userGoogle,
};
