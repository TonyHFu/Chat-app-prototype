import { useEffect } from "react";

export default function Cable(props) {
	const { cableApp, conversation, handleReceivedMessage } = props;
	useEffect(() => {
		const messageChannel = cableApp.cable.subscriptions.create(
			{
				channel: "MessagesChannel",
				conversation: conversation.id,
			},
			{
				connected: () => {
					console.log(
						`message connected here with friend: ${conversation.friend_first_name}`
					);
				},
				received: handleReceivedMessage,
				disconnected: () =>
					console.log(
						`message disconnected here with friend: ${conversation.friend_first_name}`
					),
			}
		);
		return () => {
			messageChannel.unsubscribe();
		};
	});
	return;
}
