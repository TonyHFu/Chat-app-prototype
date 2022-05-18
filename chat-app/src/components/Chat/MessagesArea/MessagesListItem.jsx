import classNames from "classnames";
import "./styles/MessagesListItem.scss";
import { useEffect, useState } from "react";
import EditingForm from "./EditingForm";
import findChange from "../trackChanges";

export default function MessagesListItem(props) {
	const { message, current_user, friend_first_name } = props;
	const [hover, setHover] = useState(false);
	const [editing, setEditing] = useState(false);

	const handleMouseOver = e => {
		setHover(true);
	};

	const handleMouseOut = e => {
		setHover(false);
	};

	const handleClickEdit = e => {
		setEditing(true);
	};

	const handleClose = e => {
		setEditing(false);
	};

	//Initialize variables to prevent undefined error is messaage.edit is false
	let oldTextWithStrikes;
	let newTextWithColour;

	if (message.edit) {
		const oldTextArr = message.text.split(" ");
		const newTextArr = message.new_text.split(" ");

		//returns arrays with indices of elements matched, added, and deleted, as well as result which contains all indices
		const { matched, added, deleted, result } = findChange(
			oldTextArr,
			newTextArr
		);

		//Returns array of components with appropriate tags and classes for styling
		oldTextWithStrikes = oldTextArr.map((word, i) => {
			if (deleted.includes(i)) {
				return (
					<span key={i}>
						<s className="deleted-text">{word}</s>{" "}
					</span>
				);
			}
			return (
				<span className="matched-text" key={i}>
					{word + " "}
				</span>
			);
		});

		newTextWithColour = newTextArr.map((word, i) => {
			if (added.includes(i)) {
				return (
					<span key={i} className="added-text">
						{word + " "}
					</span>
				);
			}
			return (
				<span key={i} className="matched-text">
					{word + " "}
				</span>
			);
		});
	}

	//Render component
	return (
		<li
			className={classNames("messages-list-item", {
				current_user,
				initializer: message.initializer,
			})}
			onMouseOver={handleMouseOver}
			onMouseOut={handleMouseOut}
		>
			{/* profile picture if not current user */}
			{!current_user && (
				<img
					className="profile-picture"
					src={`/seed_assets/${friend_first_name}.png`}
				></img>
			)}

			{/* If message is not an edit display message without edited style*/}
			{!message.edit && (
				<div className="text-and-edit-section">
					<div className="original-message">
						{<p className="message-text">{message.text}</p>}

						{/* Edit icon on hover */}
						{hover && !current_user && !message.edit && !editing && (
							<i
								onClick={handleClickEdit}
								className="fa-solid fa-pen-to-square edit-button"
							></i>
						)}
					</div>

					{/* Edit form if editing  */}
					{editing && (
						<EditingForm
							oldText={message.text}
							handleClose={handleClose}
							message={message}
						></EditingForm>
					)}
				</div>
			)}
			{/* If message is edit, display with appropriate style */}
			{message.edit && (
				<div className="edited-message">
					<div className="old-text">
						<i className="fa-solid fa-xmark"></i>
						<p className="message-text">{oldTextWithStrikes}</p>
					</div>
					<div className="new-text">
						<i className="fa-solid fa-check"></i>
						<p className="message-text">{newTextWithColour}</p>
					</div>
				</div>
			)}
		</li>
	);
}
