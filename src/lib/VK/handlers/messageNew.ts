import { MessageContext } from "vk-io";

export default async function messageNewHandler(
	context: MessageContext,
): Promise<void> {
	// Logic
	console.log(context);
}
