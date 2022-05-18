import classNames from "classnames";
import "./styles/ConversationsListItem.scss";

export default function ConversationsListItem(props) {
	const { conversation, handleClick, lastMessage } = props;

	//if friendship not accepted yet and you are the requester, always seen
	//if you are the sender of the latest message, always seen
	const unseen =
		!conversation.accepted &&
		conversation.friend_id !== conversation.requester_id
			? false
			: lastMessage.sender_id !== conversation.friend_id
			? false
			: !conversation.seen;

	/* If the latest message is not an initializer (request or acceptance), and not an edit, set appropriate message preview */

	let senderName =
		lastMessage &&
		!lastMessage.initializer &&
		!lastMessage.edit &&
		(lastMessage.sender_id === conversation.friend_id
			? conversation.friend_first_name + ": "
			: "You: ");

	return (
		<li
			key={conversation.id}
			onClick={() => handleClick(conversation.id)}
			className={classNames("conversations-list-item", {
				unseen,
			})}
		>
			<img
				className="profile-picture"
				src={`/seed_assets/${conversation.friend_first_name}.png`}
				alt={`${conversation.friend_first_name}`}
			></img>
			<div className="conversation-preview">
				{conversation.friend_first_name + " " + conversation.friend_last_name}
				<br></br>
				<span className="message-preview">
					{/* If the latest message is a request, set appropriate message preview */}
					{lastMessage.initializer &&
						lastMessage.text === "request" &&
						(lastMessage.sender_id === conversation.friend_id
							? conversation.friend_first_name +
							  " has sent you a friend request"
							: "You have sent a friend request ")}
					{/* If the latest message is a request acceptance, set appropriate message preview */}
					{lastMessage.initializer &&
						lastMessage.text === "accept" &&
						(lastMessage.sender_id === conversation.friend_id
							? conversation.friend_first_name +
							  " has accepted your friend request"
							: `You have accepted ${conversation.friend_first_name}'s friend request`)}
					{lastMessage.edit &&
						(lastMessage.sender_id === conversation.friend_id
							? conversation.friend_first_name + " has made a correction"
							: `You have made a correction`)}

					{/* Limit message preview to 26 characters long */}
					{lastMessage &&
						!lastMessage.initializer &&
						!lastMessage.edit &&
						(senderName.length + lastMessage.text.length > 26
							? (senderName + lastMessage.text).slice(0, 26) + "..."
							: senderName + lastMessage.text)}
				</span>
			</div>
		</li>
	);
}
