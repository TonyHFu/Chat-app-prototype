import "./App.scss";
import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import axios from "axios";
import DropDownLogin from "./components/DropDownLogin";
import ProfilePopup from "./components/Profiles/ProfilePopup";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import { API_ROOT } from "./constants";
import classNames from "classnames";

import useApplicationData from "./hooks/useAppData";
import Cable from "./components/Cable";

// Helper for chat
//Sorts conversations by latest message, latest first
const sortConversations = conversations => {
	//Sorts messages first
	const sortedMessagesConversations = conversations.map(conversation => {
		const sortedMessagesLatestFirst = conversation.messages.sort(
			(a, b) => new Date(b.created_at) - new Date(a.created_at)
		);
		return { ...conversation, messages: sortedMessagesLatestFirst };
	});
	//User sorted messages to sort conversations
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

	const location = useLocation();

	const [userState, setUserState] = useState({
		isLoggedIn: false,
		user: { id: 1 },
		// Auto logins in user 1
	});

	console.log("#######################", userState.user);

	//State for handling modal open and close
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
	// Retreives user data from server
	const userInformation = users.users;

	const targetUser = userInformation.find(u => userState.user.id === u.user.id);
	// This is used in Profiles, create helper to make DRY
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

	useEffect(() => {
		//Skip if not logged in
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
						//Conversations are stored as sorted by last message
						conversations: sortedConversations,
					};
				});

				// check sorted conversations for deleted false
				// and seen to be false
				// if satisfies both conditions, setAlert to true

				const conversationChecked = sortedConversations.some(conversation => {
					const sortedMessagesLatestFirst = conversation.messages.sort(
						(a, b) => new Date(b.created_at) - new Date(a.created_at)
					);
					const lastMessage = sortedMessagesLatestFirst[0];
					const lastSenderId = lastMessage.sender_id;
					//If logged in user is the sender of the message, then they have seen it
					if (lastSenderId === logged_in_user.id) {
						return false;
					}

					return !conversation.deleted && !conversation.seen;
				});
				setAlert(conversationChecked);
			});
		//Creates subscription to the conversations channel
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
			//Unsubscribe on unmount
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
				`https://intense-wave-95323.herokuapp.com/conversations/${id}`,
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
		//Create fields not in the cable communication but required in state
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
					//Set as most recent conversation
					conversations: [newConversation, ...prev.conversations],
					activeConversation:
						location.pathname === "/chat" &&
						newConversation.requester_id !== friend_id
							? newConversation.id
							: prev.activeConversation,
				};
			});

			setAlert(prev => {
				//If the request is from someone else, you should be alerted
				return newConversation.requester_id === friend_id ? true : prev;
			});
		}

		if (action === "delete") {
			setState(prev => {
				//replace the deleted conversation with the one from cable
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
				//alerted if friend accepts your request and you are not already on that conversation
				setAlert(prevAlert =>
					conversation.requester_id !== friend_id &&
					prev.activeConversation !== conversation.id
						? true
						: prevAlert
				);
				//Set seen to false if friend accepts your request and you are not already on that conversation
				if (
					newConversation.requester_id === logged_in_user.id &&
					prev.activeConversation !== newConversation.id
				) {
					newConversation.seen = false;
				}
				//Set seen to true and tell server if your friend accepts your request and you ARE on that conversation
				if (
					newConversation.requester_id === logged_in_user.id &&
					prev.activeConversation === newConversation.id
				) {
					newConversation.seen = true;
					axios
						.put(
							`https://intense-wave-95323.herokuapp.com/conversations/${conversation.id}`,
							{ action_type: "seen" },
							{
								withCredentials: true,
							}
						)
						.then(response => {
							console.log(
								`conversation id ${conversation.id} was successfully seen`
							);
						})
						.catch(error => {
							console.log("api errors:", error);
						});
				}
				const nonUpdatedConversations = prev.conversations.filter(
					prevConversation => {
						return prevConversation.id !== conversation.id;
					}
				);

				return {
					...prev,
					//Put newly accepted conversation first in line
					conversations: [newConversation, ...nonUpdatedConversations],
				};
			});
		}
		if (action === "seen") {
			setState(prev => {
				//Updates the conversations state with the updated conversation from cable
				const updatedConversations = prev.conversations.map(
					prevConversation => {
						if (prevConversation.id === conversation.id) {
							return newConversation;
						}
						return prevConversation;
					}
				);
				//conversationChecked is used to set alert
				//True if conversation is not deleted and not seen
				//False if you are the sender of the last message
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
			//Set alert to true if sender is someone else and you are not on that conversation
			//Else keep previous state
			setAlert(prevAlert => {
				return message.sender_id !== logged_in_user.id &&
					prev.activeConversation !== message.conversation_id
					? true
					: prevAlert;
			});
			//prepend new message
			const conversations = [...prev.conversations];
			const conversation = conversations.find(
				conversation => conversation.id === message.conversation_id
			);
			conversation.messages = [...conversation.messages, message];
			//Set seen status to false if not on that conversation
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
						`https://intense-wave-95323.herokuapp.com/conversations/${message.conversation_id}`,
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

	//Filter non-deleted messages
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
				<a id="nav-profiles-button" href="/profiles">
					<div className="home-logo">
						<img id="bridge-logo" src="/bridge.png" />
						<p>Bridge</p>
					</div>
				</a>

				<div className="nav-right-icons">
					<a className="chat-logo-button" href="/chat">
						{alert && <i class="fa-solid fa-comment-dots alert"></i>}

						{!alert && <i class="fa-solid fa-comment-dots"></i>}
					</a>

					<a className="profile-logo-button" href="javascript:void(0)">
						<img id="profile-logo" src="/account.png" onClick={handleOpen} />
					</a>

					<DropDownLogin
						className={"dropDownMenu"}
						state={userState}
						setState={setUserState}
						userInformation={userInformation}
					/>
				</div>

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
