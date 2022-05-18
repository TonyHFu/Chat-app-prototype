import React from "react";
import NewMessageForm from "./NewMessageForm";
import "./styles/MessagesArea.scss";
import MessagesList from "./MessagesList";
import ConversationRequestForm from "./ConversationRequestForm";

const MessagesArea = ({
	conversation: {
		id,
		friend_id,
		messages,
		friend_first_name,
		friend_last_name,
		accepted,
		requester_id,
		accepter_id,
	},
	logged_in_user,
}) => {
	return (
		<div className="messagesArea">
			<div className="message-area-banner">
				<img
					className="profile-picture"
					src={`/seed_assets/${friend_first_name}.png`}
					alt={`${friend_first_name}`}
				></img>
				{friend_first_name + " " + friend_last_name}
			</div>

			{/* If not accepted, render form */}
			{!accepted && (
				<ConversationRequestForm
					friend_id={friend_id}
					accepted={accepted}
					requester_id={requester_id}
					accepter_id={accepter_id}
					conversation_id={id}
				></ConversationRequestForm>
			)}

			{/* If accepted, render message list and new message form */}
			{accepted && (
				<MessagesList
					messages={messages}
					friend_id={friend_id}
					friend_first_name={friend_first_name}
					friend_last_name={friend_last_name}
					logged_in_user={logged_in_user}
				></MessagesList>
			)}
			{accepted && (
				<NewMessageForm
					conversation_id={id}
					logged_in_user={logged_in_user}
					friend_id={friend_id}
				/>
			)}
		</div>
	);
};

export default MessagesArea;
