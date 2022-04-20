import classNames from "classnames";
export default function MessagesListItem(props) {
	const { sender, message, current_user } = props;
	return (
		<li
			key={message.id}
			className={classNames("messages-list-item", { current_user })}
		>
			{sender}: {message.text}
		</li>
	);
}