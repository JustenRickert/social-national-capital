import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { createStore, combineReducers } from "./state-util";
import { city, achievement } from "./state.js";

ReactDOM.render(<App />, document.getElementById("root"));
