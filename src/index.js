import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import App from "./App";
import {
  createStore,
  combineReducers,
  readLocalStorage,
  writeLocalStorage
} from "./state-util";
import { city, achievement } from "./state.js";

const stateTree = {
  city: undefined,
  achievement: undefined
};

const readAppStateFromLocalStorage = (paths, precedingPath = "") => {
  if (!paths) return readLocalStorage(precedingPath) || undefined;
  return Object.entries(paths).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: readAppStateFromLocalStorage(value, precedingPath + "." + key)
    }),
    {}
  );
};

const writeAppStateFromLocalStorage = (state, paths, precedingPath = "") => {
  if (!paths) {
    writeLocalStorage(precedingPath, state);
    return;
  }
  return Object.entries(paths).forEach(([key, value]) =>
    writeAppStateFromLocalStorage(state[key], value, precedingPath + "." + key)
  );
};

ReactDOM.render(
  <App
    initialState={readAppStateFromLocalStorage(stateTree, "state")}
    handleSave={state =>
      writeAppStateFromLocalStorage(state, stateTree, "state")
    }
  />,
  document.getElementById("root")
);
