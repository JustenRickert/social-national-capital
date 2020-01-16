import React, { useReducer, useRef, useCallback } from "react";
import { combineReducers } from "@reduxjs/toolkit";
import {
  initialCityState,
  createCitySlice,
  taxWorkersAction
} from "./city-module.js";
import { initialUpgradeState, createUpgradeSlice } from "./city-upgrades.js";
import City, { useCityInterval } from "./City.js";
import { UpgradeMenu } from "./CityUpgrade.js";
import { SOCIAL } from "./constants.js";
import "./App.css";
import logo from "./logo.svg";

const App = () => {
  const citySlice = useRef(createCitySlice());
  const upgradeSlice = useRef(createUpgradeSlice());
  const [state, dispatch] = useReducer(
    combineReducers({
      city: citySlice.current.reducer,
      upgrade: upgradeSlice.current.reducer
    }),
    {
      city: initialCityState,
      upgrade: initialUpgradeState
    }
  );

  // this should maybe(?) not be tied up in the React render cycle... :shrug:
  const { actions: cityActions } = citySlice.current;
  useCityInterval({
    onSocialGrowth: () => {
      console.log("growing SOCIAL?");
      dispatch(cityActions.updateWealth(SOCIAL));
    }
  });

  return (
    <div className="App">
      <UpgradeMenu upgrade={state.upgrade} />
      <City
        city={state.city}
        onTaxWorkers={() => {
          const action = taxWorkersAction(state.city);
          // TODO: make a dialog with this
          if (action.error) console.log(action.meta.message);
          dispatch(action);
        }}
        onLevelEstablishment={establishment => {
          dispatch(citySlice.current.actions.levelEstablishment(establishment));
        }}
        onUpgradeEstablishment={action => {
          dispatch(citySlice.current.actions.upgradeEstablishment(action));
        }}
      />
    </div>
  );
};

export default App;
