import assert from "assert";
import { createSlice, createAction } from "@reduxjs/toolkit";
import {
  randomDeviation,
  randomCityName,
  sample,
  range,
  update
} from "./utils.js";
import {
  upgradeLevelCost,
  totalStateMoney,
  growthUpperLimit,
  remainingCapitalGrowthPercentage
} from "./city-utils";
import { SOCIAL, NATIONAL, CAPITAL } from "./constants";

// export const establishmentScalarProduct = (establishments, scalarKey) =>
//   Object.values(establishments).reduce((scalarSum, establishment) => {
//     const scalars = Object.values(establishment.upgrades).reduce(
//       (scalars, upgrade) =>
//         scalars.concat(
//           Object.entries(upgrade.scalars)
//             .filter(([key]) => key === scalarKey)
//             .map(([, scalar]) => Math.pow(scalar, upgrade.level))
//         ),
//       []
//     );

//     const scalarSummand = scalars.reduce(
//       (scalarSummand, scalar) => scalarSummand + scalar,
//       0
//     );

//     return scalarSummand;
//   }, 1);

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
    workers: 1,
    establishments: {},
    wealth: 0
  },

  [NATIONAL]: {
    officials: 0,
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

const tap = (extra, x) => (console.log(extra, x), x);

export const createCitySlice = (initialState = initialCityState) =>
  createSlice({
    name: "city",
    initialState,

    reducers: {
      updateWealth: (state, { payload: stateType }) =>
        update(state, stateType, state =>
          Object.assign({}, state, {
            wealth: state.wealth + state.workers
          })
        ),

      tax: (state, { payload: { stateType, amount } }) =>
        update(state, [stateType, "wealth"], wealth => wealth - amount)

      // commitWorkerDeath: state => {
      //   const percentDebt = state.workerWages / totalStateMoney(state);
      //   const deaths = Math.floor(
      //     state.workerDeathRate * percentDebt * state.workers
      //   );
      //   state.workers -= deaths;
      //   state.workers += deaths;
      // },

      // growCapital: state => {
      //   state.capital += state.growth;

      //   const remainingPercentage = remainingCapitalGrowthPercentage(state);
      //   if (!remainingPercentage) return;

      //   const growth = Math.ceil(
      //     remainingPercentage *
      //       randomDeviation(state.workers * state.workerEfficiency, 0.25)
      //   );

      //   state.capital += growth;
      // },

      // createAristocrat: state => {
      //   const totalCapacity = state.workers + state.aristocrats;
      //   const percentageAristocracy = state.aristocrats / totalCapacity;
      //   const change = Math.floor(
      //     Math.pow(1 - percentageAristocracy, 2) * 0.01 * state.workerWealth
      //   );
      //   state.workerWealth -= change;
      //   state.aristocracyWealth += change;
      //   state.aristocrats++;
      // },

      // payWorkers: state => {
      //   let totalWagePayment = state.workerWages * state.workers;
      //   if (totalWagePayment > state.capital) {
      //     totalWagePayment = state.capital;
      //     console.log("Not enuf money!");
      //   }

      //   state.capital -= totalWagePayment;
      //   state.workerWealth += totalWagePayment;
      // },

      // createWorkers: state => {
      //   const wageSurlplus = state.capital - state.workerWages * state.workers;
      //   const possibleWorkerCapacity = wageSurlplus / state.workerWages;
      //   const totalWorkerCapacity = possibleWorkerCapacity + state.workers;
      //   const unemployment = possibleWorkerCapacity / totalWorkerCapacity;
      //   if (unemployment > 0.1) {
      //     state.workers += Math.ceil(
      //       Math.max(0, randomDeviation(0.01 * possibleWorkerCapacity, 0.5))
      //     );
      //   }
      // }
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
