import { createSlice } from "@reduxjs/toolkit";
import { ADMINISTRATION, SOCIAL, NATIONAL, CAPITAL } from "./constants";
import { update } from "./utils";

const COMMUNITY_CENTER = "community center";
const LIBRARY = "library";
const DEFENSE = "defense";

export const initialUpgradeState = {
  [SOCIAL]: {
    [COMMUNITY_CENTER]: {
      initialCost: 50_000,
      level: 0,
      update: {
        wealth: 0.001
      }
    },
    [LIBRARY]: {
      initialCost: 10,
      level: 0,
      update: {
        wealth: 0.01
      }
    }
  },
  [NATIONAL]: {
    [ADMINISTRATION]: {
      initialCost: { [SOCIAL]: 1000 },
      level: 0,
      additionalPercentage: {
        officialMax: 0.001
      },
      update: {
        taxrate: 0.01
      }
    },
    [DEFENSE]: {
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
      upgradeUpgrade: (
        state,
        { payload, payload: { stateType, establishmentKey } }
      ) =>
        update(
          state,
          [stateType, establishmentKey, "level"],
          level => level + 1
        )
    }
  });
