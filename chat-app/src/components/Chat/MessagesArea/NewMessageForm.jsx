import React, { useEffect, useState } from "react";
import { API_ROOT, HEADERS } from "../../../constants";
import "./styles/NewMessageForm.scss";
import useMeasure from "react-use-measure";
export default function NewMessageForm(props) {
	const { conversation_id, logged_in_user, friend_id } = props;

	const [state, setState] = useState({
		text: "",
		conversation_id: null,
		sender_id: null,
		receiver_id: null,
	});

	//Imported hook to dynamically size textarea based on text length
	const [ref, bounds] = useMeasure();
	const maxHeight = 5;

	useEffect(() => {
		setState(prev => {
			return {
				...prev,
				conversation_id: conversation_id,
				sender_id: logged_in_user.id,
				receiver_id: friend_id,
			};
		});
	}, [props, conversation_id, friend_id, logged_in_user.id]);

	const handleChange = e => {
		setState(prev => {
			return { ...prev, text: e.target.value };
		});
	};

	const handleKeyDown = e => {
		if (e.key === "Enter") {
			handleSubmit(e);
		}
	};
	const handleSubmit = e => {
		e.preventDefault();

		fetch(`${API_ROOT}/messages`, {
			method: "POST",
			headers: HEADERS,
			body: JSON.stringify(state),
		});
		setState(prev => {
			return { ...prev, text: "" };
		});
	};

	//Set input height based on length vs textbox width
	//0.12348 is magic number found through trial and error
	let inputHeight;

	inputHeight = Math.min(
		maxHeight,
		Math.max(1, Math.ceil(state.text.length / bounds.width / 0.2))
	);

	return (
		<form
			onSubmit={handleSubmit}
			className="newMessageForm"
			style={{ height: inputHeight * 30 }}
		>
			<br />
			<textarea
				value={state.text}
				onChange={handleChange}
				className="new-message-textbox"
				ref={ref}
				style={{ height: inputHeight * 18 }}
				onKeyDown={handleKeyDown}
			/>
			<button className="new-message-submit" type="submit">
				<i className="fa-solid fa-paper-plane"></i>
			</button>
		</form>
	);
}
