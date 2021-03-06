import ConversationsListItem from "./ConversationsListItem";
import "./styles/ConversationsList.scss";
export default function ConversationsList(props) {
	const { conversations, handleClick, handleReceivedMessage, cableApp } = props;

	return (
		<ul className="conversations-list">
			{conversations.map(conversation => {
				const sortedMessages = conversation.messages.sort(
					(a, b) => new Date(a.created_at) - new Date(b.created_at)
				);
				const lastMessage = sortedMessages[sortedMessages.length - 1];

				return (
					<ConversationsListItem
						key={conversation.id}
						conversation={conversation}
						lastMessage={lastMessage}
						cableApp={cableApp}
						handleClick={handleClick}
						handleReceivedMessage={handleReceivedMessage}
					/>
				);
			})}
		</ul>
	);
}
