import React, { useState } from "react";
import "./Profile.scss";

import Modal from "@mui/material/Modal";
import ProfilePopup from "./ProfilePopup";

export default function Profile(props) {
	// State for handling open and closing profilePopup feature
	const [open, setOpen] = useState(false);
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	// Make DRY by adding to helper function folder
	const flags = function (languageId) {
		switch (languageId) {
			case 1:
				return "🇬🇧";
			case 2:
				return "🇰🇷";
			case 3:
				return "🇯🇵";
			case 4:
				return "🇨🇳";
			case 5:
				return "🇫🇷";
			case 6:
				return "🇪🇸";
			case 7:
				return "🇵🇹";
			case 8:
				return "🇮🇳";
			default:
				return "";
		}
	};

	let shortendedBio = "";
	if (props.bio.length < 55) {
		shortendedBio = props.bio;
	} else {
		let counter = 3;
		for (let word of props.bio.split(" ")) {
			if (counter + word.length >= 55) {
				break;
			}
			shortendedBio += word + " ";
			counter += word.length + 1;
		}
		shortendedBio += "...";
	}

	return (
		<>
			<div
				className="mdc-card mdc-card--outlined profile-card"
				onClick={handleOpen}
			>
				<div>
					<span>{props.firstName}</span> <span>{props.lastName}</span>
				</div>
				<div className="my-card__media">
					<img
						className="profile-img"
						src={props.image}
						alt="profile picture"
					/>
				</div>
				<div>{props.langauages}</div>
				<div className="languages-container">
					<span className="native">
						{props.languages
							.filter(language => !language.learning)
							.map(language => flags(language.language_id))}
					</span>
					<i className="fa-solid fa-right-left"></i>
					<span className="learning">
						{props.languages
							.filter(language => language.learning)
							.map(language => flags(language.language_id))}
					</span>
				</div>

				{/* <br /> */}

				{props.bio.length !== 0 && <p className="user-bio">{shortendedBio}</p>}

				{/* <Button
				variant="contained"
				className="expand-profile-button"
				onClick={handleOpen}
			>
				Expand Profile
			</Button> */}
			</div>
			<Modal
				open={open}
				onClose={handleClose}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<ProfilePopup
					key={props.id}
					id={props.id}
					firstName={props.firstName}
					lastName={props.lastName}
					image={props.image}
					bio={props.bio}
					languages={props.languages}
					loggedInUser={props.loggedInUser}
					friendRequest={props.friendRequest}
					setFriendRequest={props.setFriendRequest}
				/>
			</Modal>
		</>
	);
}
