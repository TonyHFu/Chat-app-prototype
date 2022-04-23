import logo from "./logo.svg";
import "./App.css";
import { ActionCable } from "react-actioncable-provider";
import { useState, useEffect } from "react";
import { Link, Outlet, BrowserRouter, Routes, Route } from "react-router-dom";
import { ActionCableProvider } from "react-actioncable-provider";
import Chat from "./components/Chat";
import Login from "./components/Login";
import Login2 from "./components/Login2";
import axios from "axios";
import Login3 from "./components/Login3";
import DropDownLogin from "./components/DropDownLogin";
import ProfilePopup from "./components/Profiles/ProfilePopup";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { API_ROOT } from "./constants";
import classNames from "classnames";

import useApplicationData from "./hooks/useAppData";
import Cable from "./components/Cable";
// import userInformation from "./components/Profiles/helpers/sample_users";

// Define theme settings
const light = {
	palette: {
		mode: "light",
	},
};

const dark = {
	palette: {
		mode: "dark",
	},
};

//helpers for chat

const sortConversations = conversations => {
	const sortedMessagesConversations = conversations.map(conversation => {
		const sortedMessagesLatestFirst = conversation.messages.sort(
			(a, b) => new Date(b.created_at) - new Date(a.created_at)
		);
		return { ...conversation, messages: sortedMessagesLatestFirst };
	});
	const sortedConversations = sortedMessagesConversations.sort((a, b) => {
		if (!b.messages.length && !a.messages.length) {
			return 0;
		}
		if (!b.messages.length) {
			return -1;
		}
		if (!a.messages.length) {
			return 1;
		}
		return (
			new Date(b.messages[0].created_at) - new Date(a.messages[0].created_at)
		);
	});
	return sortedConversations;
};

function App(props) {
	const { cableApp } = props;

	const [userState, setUserState] = useState({
		isLoggedIn: false,
		user: { id: 1 }, // Figure this out later
	});

	const [open, setOpen] = useState(false);
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	// The light theme is used by default
	const [isDarkTheme, setIsDarkTheme] = useState(false);
	// This function is triggered when the Switch component is toggled
	const changeTheme = () => {
		setIsDarkTheme(!isDarkTheme);
	};

	const { users } = useApplicationData();
	const userInformation = users.users;

	const targetUser = userInformation.find(u => userState.user.id === u.user.id); // This is used in Profiles, create helper to make DRY
	const targetLanguages = targetUser?.languages || [];
	console.log("targetLanguages, ", targetLanguages);

	//Alert state
	const [alert, setAlert] = useState(false);

	//
	//Chat functions
	//

	const logged_in_user = userState.user;
	const isLoggedIn = userState.isLoggedIn;

	const [state, setState] = useState({
		conversations: [],
		activeConversation: null,
	});

	//seen is false, alert should become true
	useEffect(() => {
		if (!isLoggedIn) {
			return;
		}
		let conversationsChannel;
		fetch(`${API_ROOT}/conversations`, { credentials: "include" })
			.then(res => res.json())
			.then(conversations => {
				const sortedConversations = sortConversations(conversations);

				setState(prev => {
					return {
						...prev,
						conversations: sortedConversations,
					};
				});

				// first check sorted conversations for deleted false
				// then check for seen to be false
				// if satisfies both conditions, setAlert to true

				const conversationChecked = sortedConversations.some(conversation => {
					const sortedMessagesLatestFirst = conversation.messages.sort(
						(a, b) => new Date(b.created_at) - new Date(a.created_at)
					);
					const lastMessage = sortedMessagesLatestFirst[0];
					const lastSenderId = lastMessage.sender_id;
					if (lastSenderId === logged_in_user.id) {
						return false;
					}

					return !conversation.deleted && !conversation.seen;
				});
				setAlert(conversationChecked);
			});

		conversationsChannel = cableApp.cable.subscriptions.create(
			{
				channel: "ConversationsChannel",
			},
			{
				connected: () => console.log("connected with this"),
				received: handleReceivedConversation,
				disconnected: () => console.log("disconnected with this"),
			}
		);

		return () => {
			if (conversationsChannel) {
				conversationsChannel.unsubscribe();
			}
		};
	}, [logged_in_user]);

	const handleClick = id => {
		//sets state now instead of waiting for axios call to resolve to speed up user display
		setState(prev => {
			return { ...prev, activeConversation: id };
		});
		//if logged in user is the requester, then click should not send an axios request as we want the
		//user with pending request to not have conversation unbolded.
		const conversation = [...conversations].find(
			conversation => conversation.id === id
		);
		if (
			!conversation.accepted &&
			logged_in_user.id === conversation.requester_id
		) {
			return;
		}

		const latestMessage = conversation.messages.sort(
			(a, b) => new Date(b.created_at) - new Date(a.created_at)
		)[0];
		//skip axios put if the sender is clicking the conversation
		if (logged_in_user.id === latestMessage.sender_id) {
			return;
		}

		//axios request to the server telling it that the latest message for the conversation has now been seen
		axios
			.put(
				`http://localhost:3000/conversations/${id}`,
				{ action_type: "seen" },
				{
					withCredentials: true,
				}
			)
			.then(response => {
				console.log(`conversation id ${id} was successfully seen`);
			})
			.catch(error => {
				console.log("api errors:", error);
				setState(prev => {
					return { ...prev };
				});
			});
	};

	const handleReceivedConversation = response => {
		const { conversation, action } = response;

		const friend_id =
			conversation.requester_id === logged_in_user.id
				? conversation.accepter_id
				: conversation.requester_id;
		const newConversation = {
			...conversation,
			friend_id,
			friend_first_name:
				friend_id === conversation.accepter_id
					? conversation.accepter.first_name
					: conversation.requester.first_name,
			friend_last_name:
				friend_id === conversation.accepter_id
					? conversation.accepter.last_name
					: conversation.requester.last_name,
		};
		if (action === "create") {
			//Difficult to send a separate message through message channel, so while initializer message is
			//saved in the db, on receiving empty conversation, create a placeholder initializer message in react
			//until conversation is clicked on and rerendered with response from axios call
			newConversation.messages = [
				{
					id: 0,
					text: "request",
					conversation_id: newConversation.id,
					sender_id: newConversation.requester_id,
					receiver_id: newConversation.accepter_id,
					seen: false,
					initializer: true,
					created_at: new Date(),
				},
			];
			setState(prev => {
				return {
					...prev,
					conversations: [newConversation, ...prev.conversations],
					activeConversation:
						newConversation.requester_id !== friend_id
							? newConversation.id
							: prev.activeConversation,
				};
			});

			setAlert(prev => {
				return newConversation.requester_id === friend_id ? true : prev;
			});
		}

		if (action === "delete") {
			setState(prev => {
				const updatedConversations = prev.conversations.map(
					prevConversation => {
						if (prevConversation.id === conversation.id) {
							return newConversation;
						}
						return prevConversation;
					}
				);
				return {
					...prev,
					conversations: updatedConversations,
					activeConversation:
						prev.activeConversation === conversation.id
							? null
							: prev.activeConversation,
				};
			});
		}
		if (action === "accept") {
			//Difficult to send a separate message through message channel, so while initializer message is
			//saved in the db, on receiving empty conversation, create a placeholder initializer message in react
			//until conversation is clicked on and rerendered with response from axios call
			newConversation.messages = [
				{
					id: 0,
					text: "accept",
					conversation_id: newConversation.id,
					sender_id: newConversation.accepter_id,
					receiver_id: newConversation.requester_id,
					seen: false,
					initializer: true,
					created_at: new Date(),
				},
			];

			setState(prev => {
				setAlert(prevAlert =>
					conversation.requester_id !== friend_id &&
					prev.activeConversation !== conversation.id
						? true
						: prevAlert
				);
				if (
					newConversation.requester_id === logged_in_user.id &&
					prev.activeConversation !== newConversation.id
				) {
					newConversation.seen = false;
				}
				const nonUpdatedConversations = prev.conversations.filter(
					prevConversation => {
						return prevConversation.id !== conversation.id;
					}
				);
				return {
					...prev,
					conversations: [newConversation, ...nonUpdatedConversations],
				};
			});
		}
		if (action === "seen") {
			setState(prev => {
				const updatedConversations = prev.conversations.map(
					prevConversation => {
						if (prevConversation.id === conversation.id) {
							return newConversation;
						}
						return prevConversation;
					}
				);

				const conversationChecked = updatedConversations.some(conversation => {
					const sortedMessagesLatestFirst = conversation.messages.sort(
						(a, b) => new Date(b.created_at) - new Date(a.created_at)
					);
					const lastMessage = sortedMessagesLatestFirst[0];
					const lastSenderId = lastMessage.sender_id;
					if (lastSenderId === logged_in_user.id) {
						return false;
					}

					return !conversation.deleted && !conversation.seen;
				});
				setAlert(conversationChecked);
				return {
					...prev,
					conversations: updatedConversations,
				};
			});
		}
	};

	const handleReceivedMessage = response => {
		const { message } = response;

		setState(prev => {
			const conversations = [...prev.conversations];
			const conversation = conversations.find(
				conversation => conversation.id === message.conversation_id
			);
			conversation.messages = [...conversation.messages, message];
			if (prev.activeConversation !== conversation.id) {
				conversation.seen = false;
			}

			// If on that conversation, tell server message is read
			if (
				message.conversation_id === prev.activeConversation &&
				logged_in_user.id !== message.sender_id
			) {
				axios
					.put(
						`http://localhost:3000/conversations/${message.conversation_id}`,
						{ action_type: "seen" },
						{
							withCredentials: true,
						}
					)
					.then(response => {
						console.log(
							`conversation id ${message.conversation_id} was successfully seen`
						);
					})
					.catch(error => {
						console.log("api errors:", error);
					});
			}
			return { ...prev, conversations: sortConversations(conversations) };
		});
	};

	const { conversations, activeConversation } = state;

	const filteredConversations = conversations.filter(conversation => {
		return !conversation.deleted;
	});

	//rendering component

	return (
		<div
			style={{
				"background-color": isDarkTheme ? "#2e2d2d" : "white",
				color: isDarkTheme ? "white" : "black",
			}}
		>
			<nav className="nav">
				<Button variant="contained" href="/profiles">
					Profiles
				</Button>
				<Button variant="contained" onClick={handleOpen}>
					Current User
				</Button>
				<Button
					variant="contained"
					href="/chat"
					className={classNames({ alert })}
				>
					Chat
				</Button>
				<DropDownLogin
					className="drop-down-main"
					state={userState}
					setState={setUserState}
					userInformation={userInformation}
				/>

				<Modal
					open={open}
					onClose={handleClose}
					aria-labelledby="modal-modal-title"
					aria-describedby="modal-modal-description"
				>
					<ProfilePopup
						key={userState.user.id}
						currentUser={true}
						id={userState.user.id}
						firstName={userState.user.first_name}
						lastName={userState.user.last_name}
						image={userState.user.image}
						bio={userState.user.bio}
						languages={targetLanguages}
						checked={isDarkTheme}
						onChange={changeTheme}
					/>
				</Modal>
			</nav>

			{filteredConversations.map(conversation => {
				return (
					<Cable
						key={conversation.id}
						conversation={conversation}
						handleReceivedMessage={handleReceivedMessage}
						cableApp={cableApp}
					></Cable>
				);
			})}
			<Outlet
				context={{
					logged_in_user: userState.user,
					isLoggedIn: userState.isLoggedIn,
					cableApp,
					filteredConversations,
					handleClick,
					activeConversation,
					handleReceivedMessage,
				}}
			/>
		</div>
	);
}

export default App;
