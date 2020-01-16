import { createSlice, createAction } from "@reduxjs/toolkit";
import { SOCIAL, NATIONAL, CAPITAL } from "./constants";
import { update } from "./utils";

const COMMUNITY_CENTER = "community center";

const LIBRARY = "library";

export const computeUpgradeCost = (
  name,
  establishment,
  state = initialUpgradeState
) => {
  const upgrade = state[name][establishment];
  return Math.pow(upgrade.initialCost, upgrade.level + 1);
};

export const initialUpgradeState = {
  [SOCIAL]: {
    [COMMUNITY_CENTER]: {
      initialCost: 10,
      level: 0,
      scalars: {}
    },
    [LIBRARY]: {
      initialCost: 100,
      level: 0,
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
    technology: {
      level: 0
    }
  }
};

export const createUpgradeSlice = (initialState = initialUpgradeState) =>
  createSlice({
    name: "upgrade",
    initialState,
    reducers: {
      upgradeUpgrade: (state, { payload: { stateType, establishment } }) =>
        update(state, [stateType, establishment, "level"], level => level + 1)
    }
  });
