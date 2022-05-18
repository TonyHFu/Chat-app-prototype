import * as React from "react";
import { useState } from "react";
import { useOutletContext } from "react-router-dom";

import Profile from "./Profiles/Profile";
import "./Profiles.scss";
import useApplicationData from "../hooks/useAppData";
import DropDownFilter from "./DropDownFilter";

export default function Profiles() {
	const { users, friendRequest, setFriendRequest } = useApplicationData();
	const { logged_in_user, cableApp } = useOutletContext();
	const [languageId, setLanguageId] = useState(0);

	// Pulls user data from server
	const userInformation = users.users;

	const handleChange = function (event) {
		// Setting language name in dropdown filter
		setLanguageId(event.target.value);
	};

	const loggedInId = logged_in_user.id || 1;
	// Finds current loggedin user from server, if undefined auto sets to user 1
	console.log("loggedInId", loggedInId);

	// Finds user information of loggedInUser
	const targetUser = userInformation.find(u => loggedInId === u.user.id);

	// Finds all the languages of loggedInUser
	const targetLanguages = targetUser?.languages || [];

	// Filters language objects array for only the languages learning for user
	const learningLanguages = targetLanguages.filter(
		language => language.learning === true
	);

	// Returns array of current user learning language ids
	const learningLanguagesIds = learningLanguages.map(
		language => language.language_id
	);

	// Filters language objects array for only the languages native for user
	const offeringLanguages = targetLanguages.filter(
		language => language.learning === false
	);

	// Returns array of current user native language ids
	const offeringLanguagesIds = offeringLanguages.map(
		language => language.language_id
	);

	const usersMapped = userInformation.map(information => {
		let offeredLanguages = [];
		for (const language of information.languages) {
			// Create array of native languages per mapped user
			if (language.learning === false) {
				offeredLanguages.push(language.language_id);
			}
		}

		let mappedUserLearningLanguages=[];
		for (const language of information.languages) {
			// Create array of native languages per mapped user
			if (language.learning === true) {
				mappedUserLearningLanguages.push(language.language_id);
			}
		}

		// Match becomes true when a mapped user's native lang matches with current user's target lang
		let match = false;

		if (languageId === 0) {
			// If langId is 0 search thru all users
			// Check if mapped user native language is equal to currentUser's learning language
			for (let lang of offeredLanguages) {
				if (learningLanguagesIds.includes(lang)) {
					// Check if mapped user learning language is equal to currentUser's offered languages
					for (let learnLang of mappedUserLearningLanguages) {
						if(offeringLanguagesIds.includes(learnLang)) {
							match = true;
						}
					}
				}
			}
		} else {
			// If any other langId than 0, only filter based on native speakers of that language
			for (let lang of offeredLanguages) {
				if (languageId === lang) {
					for (let learnLang of mappedUserLearningLanguages) {
						if(offeringLanguagesIds.includes(learnLang)) {
							match = true;
						}
					}
				}
			}
		}

		if (match) {
			return (
				<Profile
					key={information.user.id}
					id={information.user.id}
					firstName={information.user.first_name}
					lastName={information.user.last_name}
					image={information.user.image}
					bio={information.user.bio}
					languages={information.languages}
					loggedInUser={logged_in_user}
					friendRequest={friendRequest}
					setFriendRequest={setFriendRequest}
				/>
			);
		}
	});

	return (
		<main id="main-container" style={{ padding: "1rem 0" }}>
			<section className="profile-container">
				<DropDownFilter
					languageId={languageId}
					setLanguageId={setLanguageId}
					learningLanguages={learningLanguages}
					learningLanguagesIds={learningLanguagesIds}
					handleChange={handleChange}
				/>
				<ul className="cards">{usersMapped}</ul>
			</section>
		</main>
	);
}
