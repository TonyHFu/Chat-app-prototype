import axios from "axios";
import React, { useState, useEffect } from "react";
import "./DropDownLogin.scss";

import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { red } from "@mui/material/colors";

export default function DropDownLogin(props) {

  const handleLogin = (data) => {
    props.setState((prev) => {
      return {
        ...prev,
        isLoggedIn: true,
        user: data.user,
      };
    });
  };

  const handleLogout = (data) => {
    props.setState((prev) => {
      return {
        ...prev,
        isLoggedIn: false,
        user: {},
      };
    });
  };

	// Gets user logged_in status and handleLogin/Logout accordingly
  const loginStatus = () => {
    axios
      .get("http://localhost:3000/logged_in", {
        withCredentials: true,
      })
      .then((response) => {
        if (response.data.logged_in) {
          handleLogin(response.data);
        } else {
          handleLogout();
        }
      })
      .catch((error) => console.log("api errors:", error));
  };

  useEffect(() => {
    loginStatus();
  }, []);

  const handleChange = (event) => {
	// Changes loggedin user
    axios
      .post(
        "http://localhost:3000/login",
        {
          user: {
            email: `admin${event.target.value}@admin.com`,
            password: "123456",
          },
        },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.data.logged_in) {
          handleLogin(response.data);
          window.location.reload(false);
        } else {
          alert("error logging in");
        }
      })
      .catch((error) => console.log("api errors:", error));
  };

  const dropDownArray = props.userInformation.map((information) => {
    return (
      <MenuItem key={information.user.id} className="login-drop-down-item" value={information.user.id}>
        <img
          src={information.user.image}
          style={{
            "max-height": "1.5em",
            "border-radius": "35%",
            margin: "-5px, 5px",
          }}
        />
        {information.user.first_name}
      </MenuItem>
    );
  });

  return (
    <Box className="drop-down-box" >
      <FormControl  fullWidth>
        <InputLabel id="demo-simple-select-label" ></InputLabel>
        <Select

          className="login-select"
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={props.state.user.id}
          label="Language"
          onChange={handleChange}
        >
          {dropDownArray}
        </Select>
      </FormControl>
    </Box>
  );
}
