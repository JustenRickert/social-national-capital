import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { createStore, combineReducers } from "./state-util";
import { city, achievement } from "./state.js";

const stateTree = {
  city: undefined,
  achievement: undefined
};

const readLocalStorage = name => {
  const item = localStorage.getItem(name);
  return item && JSON.parse(item);
};

const writeLocalStorage = (name, state) => {
  localStorage.setItem(name, JSON.stringify(state));
};

const readAppStateFromLocalStorage = (paths, precedingPath = "state") => {
  if (!paths) return readLocalStorage(precedingPath) || undefined;
  return Object.entries(paths).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: readAppStateFromLocalStorage(value, precedingPath + "." + key)
    }),
    {}
  );
};

const writeAppStateFromLocalStorage = (
  state,
  paths,
  precedingPath = "state"
) => {
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
    initialState={readAppStateFromLocalStorage(stateTree)}
    handleSave={state => writeAppStateFromLocalStorage(state, stateTree)}
  />,
  document.getElementById("root")
);
