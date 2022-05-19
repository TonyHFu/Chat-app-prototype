import React from "react";
import { API_ROOT, HEADERS } from "../../../constants";
import { useState } from "react";
import "./styles/NewConversationForm.scss";

export default function NewConversationForm(props) {
	const { logged_in_user } = props;
	const [state, setState] = useState({ accepter_id: "" });

	//Form control
	const handleChange = e => {
		setState({ accepter_id: e.target.value });
	};

	//Submitting new conversation based on user id
	const handleSubmit = e => {
		e.preventDefault();
		fetch(`${process.env.REACT_APP_API_ROOT}/conversations`, {
			method: "POST",
			headers: HEADERS,
			body: JSON.stringify({
				...state,
				requester_id: logged_in_user.id,
			}),
			credentials: "include",
		});
		setState(prev => {
			return { ...prev, accepter_id: "" };
		});
	};

	return (
		<div className="new-conversation-form">
			<form onSubmit={handleSubmit}>
				<label>New Conversation:</label>
				<br />
				<input type="text" value={state.accepter_id} onChange={handleChange} />
				<input type="submit" />
			</form>
		</div>
	);
}
