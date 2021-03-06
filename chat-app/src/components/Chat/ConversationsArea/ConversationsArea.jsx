import ConversationsList from "./ConversationsList";
import NewConversationForm from "./NewConversationForm";
import "./styles/ConversationsArea.scss";

export default function ConversationsArea(props) {
	const {
		conversations,
		handleClick,
		logged_in_user,
		cableApp,
		handleReceivedMessage,
	} = props;

	return (
		<div className="conversations">
			<ConversationsList
				conversations={conversations}
				handleClick={handleClick}
				cableApp={cableApp}
				handleReceivedMessage={handleReceivedMessage}
			></ConversationsList>
			<NewConversationForm logged_in_user={logged_in_user} />
		</div>
	);
}
