import React, { useReducer, useRef, useCallback } from "react";
import { combineReducers } from "@reduxjs/toolkit";
import {
  initialCityState,
  createCitySlice,
  taxWorkersAction
} from "./city-module.js";
import { initialUpgradeState, createUpgradeSlice } from "./city-upgrades.js";
import { computeUpgradeCost } from "./city-utils";
import City, { useCityInterval } from "./City.js";
import Establishments from "./Establishments.js";
import { UpgradeMenu } from "./CityUpgrade.js";
import { SOCIAL, NATIONAL } from "./constants.js";
import "./App.css";
import logo from "./logo.svg";

const App = ({ defaultState }) => {
  const citySlice = useRef(createCitySlice());
  const upgradeSlice = useRef(createUpgradeSlice());
  const [state, dispatch] = useReducer(
    combineReducers({
      city: citySlice.current.reducer,
      upgrade: upgradeSlice.current.reducer
    }),
    // TODO(probably): { defaultState }
    {
      city: initialCityState,
      upgrade: initialUpgradeState
    }
  );

  const handleWealthUpdate = () => {
    dispatch(
      cityActions.updateWealth({ stateType: SOCIAL, upgrade: state.upgrade })
    );
  };

  // this should maybe(?) not be tied up in the React render cycle... :shrug:
  const { actions: cityActions } = citySlice.current;
  useCityInterval({
    onSocialChange: () => {
      handleWealthUpdate();

      const { [SOCIAL]: social, [NATIONAL]: national } = state.city;
      if (social.workers > 100 / 0.95 && Math.random() < social.deathchance)
        dispatch(cityActions.workerDeath());

      if (Math.random() < social.birthchance)
        dispatch(cityActions.workerBirth());

      if (Math.random() < national.taxchance) dispatch(cityActions.socialTax());
    }
  });

  const handlePurchaseUpgrade = ({ stateType, establishmentKey }) => {
    const { actions: upgradeActions } = upgradeSlice.current;
    const amount = computeUpgradeCost(
      stateType,
      establishmentKey,
      state.upgrade
    );
    dispatch(upgradeActions.upgradeUpgrade({ stateType, establishmentKey }));
    dispatch(cityActions.tax({ stateType, amount }));
  };

  return (
    <div className="App">
      <UpgradeMenu {...state} onPurchaseUpgrade={handlePurchaseUpgrade} />
      <City
        {...state}
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
      <Establishments upgrade={state.upgrade} />
    </div>
  );
};

export default App;
