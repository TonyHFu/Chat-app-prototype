import ConversationsList from "./ConversationsList";
import NewConversationForm from "../NewConversationForm";
export default function ConversationsArea(props) {
	const { conversations, handleClick, logged_in_user } = props;

	return (
		<div class="conversations">
			<h2>Conversations</h2>
			<ConversationsList
				conversations={conversations}
				handleClick={handleClick}
			></ConversationsList>
			<NewConversationForm logged_in_user={logged_in_user} />
		</div>
	);
}
