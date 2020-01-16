import { createSlice, createAction } from "@reduxjs/toolkit";
import { SOCIAL, NATIONAL, CAPITAL } from "./constants";

const COMMUNITY_CENTER = "community center";

const LIBRARY = "library";

export const initialUpgradeState = {
  [SOCIAL]: {
    [COMMUNITY_CENTER]: {
      initialCost: 10,
      level: 0,
      scalars: {}
    },
    [LIBRARY]: {
      initialCost: 100,
      addition: {
        wealthPerCapita: 200
      }
    }
  },
  [NATIONAL]: {
    administration: {
      initialCost: 1000,
      level: 0,
      addition: {
        wealthPerCapita: 1000
      },
      scalars: {
        wealthPerCapita: 1.1
      }
    },
    defense: {
      initialCost: 1500,
      level: 0,
      addition: {}
    }
  },
  [CAPITAL]: {
    technology: {}
  }
};

export const createUpgradeSlice = (initialState = initialUpgradeState) =>
  createSlice({
    name: "upgrade",
    initialState,
    reducers: {}
  });

export const computeUpgradeCost = (
  name,
  establishment,
  state = initialUpgradeState
) => {
  const upgrade = state[name][establishment];
  return Math.pow(upgrade.initialCost, upgrade.level + 1);
};

export const cityUpgradeUpgrade = createAction("city/upgrade", payload => {
  console.log(payload);
  return {
    payload
  };
});
