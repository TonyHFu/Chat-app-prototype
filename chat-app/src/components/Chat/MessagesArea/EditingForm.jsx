import "./styles/EditingForm.scss";
import { useState } from "react";
import useMeasure from "react-use-measure";
import axios from "axios";

export default function EditingForm(props) {
	const { oldText, handleClose, message } = props;

	const [newText, setNewText] = useState(oldText);
	const [ref, bounds] = useMeasure();

	const handleChange = e => {
		setNewText(e.target.value);
	};

	const handleKeyDown = e => {
		if (e.key === "Enter") {
			handleSave(e);
		}
	};
	const handleSave = e => {
		e.preventDefault();
		const { text, conversation_id, sender_id, receiver_id } = message;
		axios
			.put(
				`https://intense-wave-95323.herokuapp.com/messages/${message.id}`,
				{
					new_text: newText,
					conversation_id,
					text,
					sender_id: receiver_id,
					receiver_id: sender_id,
				},
				{
					withCredentials: true,
				}
			)
			.then(response => {
				console.log(`message ${message.id} was successfully edited`);
				setNewText("");
				handleClose();
			})
			.catch(error => {
				console.log("api errors:", error);
			});
	};

	const width = bounds.width;
	let inputHeight;
	inputHeight = Math.max(1, Math.ceil(newText.length / width / 0.125));

	return (
		<div className="editing-form">
			<textarea
				className="new-text"
				value={newText}
				style={{ height: inputHeight * 20 }}
				onChange={handleChange}
				ref={ref}
				onKeyDown={handleKeyDown}
			></textarea>
			<div className="editing-form-buttons">
				<i
					className="fa-solid fa-circle-check fa-stack edit-accept-button"
					onClick={handleSave}
				></i>
				<i
					className="fa-solid fa-circle-xmark fa-stack edit-cancel-button"
					onClick={handleClose}
				></i>
			</div>
		</div>
	);
}
