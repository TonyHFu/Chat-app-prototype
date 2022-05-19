import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Profiles from "./components/Profiles";
import Chat from "./components/Chat";
import actionCable from "actioncable";

const CableApp = {};
CableApp.cable = actionCable.createConsumer(
	"ws://intense-wave-95323.herokuapp.com/cable"
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<App cableApp={CableApp} />}>
				<Route path="chat" element={<Chat />} />
				<Route path="profiles" element={<Profiles />} />
				<Route index element={<Profiles />} />
			</Route>
		</Routes>
	</BrowserRouter>
);
