import { createSlice } from "@reduxjs/toolkit";
import {
  randomDeviation,
  randomCityName,
  update,
  randomUnitSegment,
  toObj,
  range,
  multiply
} from "./utils.js";
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
    wealth: 1e6,
    wealthPerWorker: 100,

    nationalAlignment: 0, // [-1, 1]
    fightPropagandachance: 0.01,
    fightPropagandaefficiency: 0.01
  },

  [NATIONAL]: {
    officials: 0,
    officialMax: 0,
    taxchance: 0.1,
    taxrate: 0.15,
    wealth: 0,

    createPropagandaefficiency: 0.01
  },

  [CAPITAL]: {
    aristocrats: 0,
    wealth: 0
  }
};

const toZeroOne = negOneOne => (negOneOne + 1) / 2;

const toNegOneOne = zeroOne => (zeroOne - 1 / 2) * 2;

export const createCitySlice = (initialState = initialCityState) =>
  createSlice({
    name: "city",
    initialState,

    reducers: {
      nationalCreatePropaganda: state =>
        update(state, [SOCIAL, "nationalAlignment"], nationalAlignment => {
          const {
            [NATIONAL]: { officials, createPropagandaefficiency }
          } = state;
          const alignment = toZeroOne(nationalAlignment);
          const remaining = 1 - alignment;
          const computeAlignmentChange = (percentChange, officials) =>
            officials &&
            officials * percentChange - (officials - 1) * percentChange ** 2;
          return toNegOneOne(
            alignment +
              remaining *
                computeAlignmentChange(createPropagandaefficiency, officials)
          );
        }),

      socialFightPropaganda: state =>
        update(state, [SOCIAL, "nationalAlignment"], nationalAlignment => {
          const {
            [SOCIAL]: { fightPropagandaefficiency }
          } = state;
          const remainingPercentage = toZeroOne(nationalAlignment);
          return toNegOneOne(
            remainingPercentage -
              remainingPercentage * fightPropagandaefficiency
          );
        }),

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
