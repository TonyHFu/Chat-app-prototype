import axios from "axios";

export default function PendingConversationRequest(props) {
	const { conversation_id } = props;
	const handleCancelRequest = e => {
		e.preventDefault();
		axios
			.delete(
				`http://localhost:3000/conversations/${conversation_id}`,

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
		<>
			<h3>
				You have sent this person a friend request, do you wish to cancel?
			</h3>
			<button onClick={handleCancelRequest}>cancel</button>
		</>
	);
}
