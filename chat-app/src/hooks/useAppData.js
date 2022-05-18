import { useState, useEffect } from "react";
import axios from "axios";

export default function useApplicationData(initial) {
	const [friendRequest, setFriendRequest] = useState({});
	const [users, setUsers] = useState({
		users: [],
	});

	useEffect(() => {
		const urlUsers = "https://intense-wave-95323.herokuapp.com/users";

		axios
			.get(urlUsers)
			.then(response => {
				console.log("Axios response:", response.data);
				setUsers({ users: response.data });
				const friendRequestState = {};
				response.data.forEach(user => {
					friendRequestState[user.user.id] = false;
				});
				setFriendRequest(friendRequestState);
			})
			.catch(err => console.log("catch error:", err));
	}, []);

	return { users, friendRequest, setFriendRequest };
}
