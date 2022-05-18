import axios from "axios";

export default function PendingConversationRequest(props) {
	const { conversation_id } = props;
	const handleCancelRequest = e => {
		e.preventDefault();
		axios
			.delete(
				`https://intense-wave-95323.herokuapp.com/conversations/${conversation_id}`,

				{ withCredentials: true }
			)
			.then(response => {
				console.log(
					`conversation id ${conversation_id} was successfully deleted`
				);
			})
			.catch(error => console.log("api errors:", error));
	};
	return (
		<div className="pending-request-form">
			<h3>
				You have sent this person a friend request, do you wish to cancel?
			</h3>
			<button onClick={handleCancelRequest}>cancel</button>
		</div>
	);
}
