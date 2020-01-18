import assert from "assert";
import { createSlice, createAction } from "@reduxjs/toolkit";
import {
  randomDeviation,
  randomCityName,
  sample,
  range,
  update,
  multiply
} from "./utils.js";
import {
  upgradeLevelCost,
  totalStateMoney,
  growthUpperLimit,
  remainingCapitalGrowthPercentage,
  computeUpdateWealthDelta,
  computeSocialTaxAmount
} from "./city-utils";
import { SOCIAL, NATIONAL, CAPITAL } from "./constants";

export const WORKER_TAX_RATE = "workerTaxRate";
export const WORKER_EFFICIENCY = "workerEfficiency";
export const WEALTH_PER_CAPITA = "wealthPerCapita";

export const taxWorkersAction = createAction("city/taxworkers", state => {
  const capital = totalStateMoney(state);
  const taxationPotential = Math.floor(state[WORKER_TAX_RATE] * capital);
  const payload = {
    taxationPotential
  };
  if (!taxationPotential)
    return {
      error: true,
      payload,
      meta: { message: "There is no worker wealth to be taxed." }
    };
  return { error: false, payload };
});

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
    birthchance: 0.05,
    deathchance: 0.02,
    wealth: 0
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

const exchangeWealth = (left, right, amount) => {
  assert(
    [left, right].some(d => [SOCIAL, NATIONAL, CAPITAL].some(e => d === e)),
    "check for the wealth, yo"
  );
  const value = Math.min(left.wealth, amount);
  const short = Math.max(0, amount - left.wealth);
  return {
    value,
    short
  };
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

      workerBirth: state =>
        update(
          state,
          [SOCIAL, "workers"],
          workers => workers + Math.ceil(randomDeviation(0.05 * workers, 1))
        ),

      tax: (state, { payload: { stateType, amount } }) => {
        if (typeof amount === "object") {
          const updateKeysFns = Object.entries(amount).map(
            ([stateType, amount]) => [
              [stateType, "wealth"],
              wealth => wealth - amount
            ]
          );
          return update(state, updateKeysFns);
        }
        return update(state, [stateType, "wealth"], wealth => wealth - amount);
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

    extraReducers: {
      [taxWorkersAction]: (state, { payload: { taxationPotential } }) => {
        const capableTaxation = Math.min(taxationPotential, state.workerWealth);
        const newDebt = Math.max(taxationPotential - capableTaxation, 0);
        state.debt += newDebt;
        state.workerWealth -= capableTaxation;
        state.capital += capableTaxation;
        state.workerLastTaxTimestamp = performance.now();
      }
    }
  });
