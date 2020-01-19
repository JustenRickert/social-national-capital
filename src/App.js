import React, { useReducer, useRef } from "react";
import { combineReducers } from "@reduxjs/toolkit";
import { initialCityState, createCitySlice } from "./city-module.js";
import { initialUpgradeState, createUpgradeSlice } from "./city-upgrades.js";
import { computeUpgradeCost, computeOfficialMax } from "./city-utils";
import City, { useCityInterval } from "./City.js";
import Establishments from "./Establishments.js";
import { UpgradeMenu } from "./CityUpgrade.js";
import { SOCIAL, NATIONAL } from "./constants.js";
import "./App.css";

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
  const { [SOCIAL]: social, [NATIONAL]: national } = state.city;
  useCityInterval({
    onNationalChange: () => {
      const officialMax = computeOfficialMax(state);
      if (national.officials < officialMax)
        dispatch(cityActions.officiateWorker());

      if (national.officials && Math.random() < national.taxchance)
        dispatch(cityActions.socialTax({ upgrade: state.upgrade }));
    },
    onSocialChange: () => {
      handleWealthUpdate();

      if (social.workers > 100 / 0.95 && Math.random() < social.deathchance)
        dispatch(cityActions.workerDeath());

      if (Math.random() < social.birthchance)
        dispatch(cityActions.workerBirth());
    }
  });

  const handlePurchaseUpgrade = ({ stateType, establishmentKey }) => {
    const { actions: upgradeActions } = upgradeSlice.current;
    dispatch(upgradeActions.upgradeUpgrade({ stateType, establishmentKey }));
    const amount = computeUpgradeCost(
      stateType,
      establishmentKey,
      state.upgrade
    );
    dispatch(cityActions.tax({ stateType, amount }));
  };

  return (
    <div className="App">
      <UpgradeMenu {...state} onPurchaseUpgrade={handlePurchaseUpgrade} />
      <City
        {...state}
        onLevelEstablishment={establishment => {
          dispatch(citySlice.current.actions.levelEstablishment(establishment));
        }}
        onUpgradeEstablishment={action => {
          dispatch(citySlice.current.actions.upgradeEstablishment(action));
        }}
      />
      <Establishments {...state} />
    </div>
  );
};

export default App;
