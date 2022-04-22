import "./Profile.scss";
//change Button to MUI component later- before meeting
// import Button from 'react-bootstrap/Button';
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import React, { useState, useEffect } from "react";
import ProfilePopup from "./ProfilePopup";

export default function Profile(props) {
	const [open, setOpen] = useState(false);
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

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
		}
	};

	return (
		<div className="mdc-card mdc-card--outlined">
			<div>
				<span>{props.firstName}</span> <span>{props.lastName}</span>
			</div>
			<div className="my-card__media">
				<img className="profile-img" src={props.image} />
			</div>
			<div>{props.langauages}</div>
			<div className="languages-container">
				<span className="native">
					{props.languages
						.filter(language => !language.learning)
						.map(language => flags(language.language_id))}
				</span>
				<i class="fa-solid fa-right-left"></i>
				<span className="learning">
					{props.languages
						.filter(language => language.learning)
						.map(language => flags(language.language_id))}
				</span>
			</div>
			{/* <button className="mdc-button mdc-card__action mdc-card__action--button ">
        <span className="mdc-button__label">Action 1</span>
      </button> */}
			<div> ______________________</div>
			{/* <Button
				variant="contained"
				onClick={() => {
					console.log("Messaging button clicked!");
				}}
			
				Add Friend
			</Button> */}
			<div> ______________________</div>
			<Button variant="contained" onClick={handleOpen}>
				Expand Profile
			</Button>
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
		</div>
	);
}
