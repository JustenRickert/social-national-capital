import { createSlice } from "@reduxjs/toolkit";
import { randomDeviation, randomCityName, update } from "./utils.js";
import { computeUpdateWealthDelta, computeSocialTaxAmount } from "./city-utils";
import { SOCIAL, NATIONAL, CAPITAL } from "./constants";

export const WORKER_TAX_RATE = "workerTaxRate";
export const WORKER_EFFICIENCY = "workerEfficiency";
export const WEALTH_PER_CAPITA = "wealthPerCapita";

export const initialCityState = {
  name: randomCityName(),

  flag: {
    disabled: {
      [NATIONAL]: true,
      [CAPITAL]: true
    }
  },

  [SOCIAL]: {
    workers: 100,
    workerMax: 10000,
    birthchance: 0.05,
    deathchance: 0.02,
    wealth: 0,
    wealthPerWorker: 100
  },

  [NATIONAL]: {
    officials: 0,
    officialMax: 0,
    taxchance: 0.1,
    taxrate: 0.15,
    wealth: 0
  },

  [CAPITAL]: {
    aristocrats: 0,
    wealth: 0
  }
};

export const createCitySlice = (initialState = initialCityState) =>
  createSlice({
    name: "city",
    initialState,

    reducers: {
      updateWealth: (state, { payload: { stateType, upgrade } }) => {
        const wealthDelta =
          stateType !== SOCIAL
            ? 0
            : Math.ceil(
                randomDeviation(
                  computeUpdateWealthDelta({ city: state, upgrade }),
                  0.5
                )
              );

        return update(state, stateType, state => ({
          ...state,
          wealth: state.wealth + wealthDelta
        }));
      },

      workerDeath: state =>
        update(
          state,
          [SOCIAL, "workers"],
          workers => workers - Math.ceil(randomDeviation(0.05 * workers, 1))
        ),

      workerBirth: state => {
        const {
          [SOCIAL]: { workerMax, workers }
        } = state;
        const remainingPercentage = (workerMax - workers) / workerMax;
        return update(
          state,
          [SOCIAL, "workers"],
          workers =>
            workers +
            Math.ceil(remainingPercentage * randomDeviation(0.05 * workers, 1))
        );
      },

      tax: (state, { payload: { stateType, amount } }) => {
        const updateKeysFns =
          typeof amount === "object"
            ? Object.entries(amount).map(([stateType, amount]) => [
                [stateType, "wealth"],
                wealth => wealth - amount
              ])
            : [[[stateType, "wealth"], wealth => wealth - amount]];
        return update(state, updateKeysFns);
      },

      socialTax: state => {
        const amount = computeSocialTaxAmount({ city: state });
        return update(state, [
          [[SOCIAL, "wealth"], wealth => wealth - amount],
          [[NATIONAL, "wealth"], wealth => wealth + amount]
        ]);
      },

      officiateWorker: state => {
        const amount = 1;
        return update(state, [
          [[SOCIAL, "workers"], officials => officials - amount],
          [[NATIONAL, "officials"], officials => officials + amount]
        ]);
      }
    },

    extraReducers: {}
  });
