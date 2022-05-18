import React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import "./DropDownFilter.scss";

export default function DropDownFilter(props) {
	console.log("props.languageId: ", props.languageId);

	// Add to helpers
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

	if (props.learningLanguagesIds.length === 1) {
		props.setLanguageId(props.learningLanguagesIds[0]);
	}

	//Attempt to override glitch where language filter shows 'All' briefly before changing
	// if (props.learningLanguagesIds.length === 1) {
	// 	props.setLanguageId({
	// 		id: props.learningLanguagesIds[0],
	// 		initial: false,
	// 	});
	// }
	// if (props.languageId.intial) {
	// 	props.setLanguageId({
	// 		id: 0,
	// 		initial: false,
	// 	});
	// }

	// Using learningLanguages, map thru and add id + name to Menuitem template
	const dropDownArray = props.learningLanguages.map(language => {
		return (
			<MenuItem key={language.language_id} value={language.language_id}>
				{flags(language.language_id)}
				{language.language_name}
			</MenuItem>
		);
	});

	if (dropDownArray.length !== 1) {
		dropDownArray.unshift(
			<MenuItem key={0} value={0}>
				All
			</MenuItem>
		);
	}

	return (
		<Box
			id="filter-container"
			// sx={{ maxWidth: 120 }}
		>
			<FormControl fullWidth>
				<InputLabel id="demo-simple-select-label-test">Languages</InputLabel>
				<Select
					className="language-filter"
					labelId="demo-simple-select-label"
					id="demo-simple-select"
					value={props.languageId}
					label="Language"
					onChange={props.handleChange}
				>
					{dropDownArray}
				</Select>
			</FormControl>
		</Box>
	);
}
