import { multiply, randomDeviation, addition } from "./utils";
import { SOCIAL, NATIONAL } from "./constants";

export const upgradeLevelCost = upgrade =>
  upgrade.initialCost * Math.pow(10, upgrade.level);

export const totalStateMoney = state =>
  state.capital + state.workerWealth + state.workerDebt;

export const growthUpperLimit = state => state.workers * state.wealthPerCapita;

export const remainingCapitalGrowthPercentage = state => {
  const upperLimit = growthUpperLimit(state);
  if (upperLimit <= 0) return;
  const remainingPercentageCapital =
    (upperLimit - totalStateMoney(state)) / upperLimit;

  return remainingPercentageCapital;
};

export const toPercentage = rate => (rate * 100).toFixed(1) + "%";

const expUpgradeCost = ({ initialCost: principle, level: interest }) =>
  Math.pow(principle, interest + 1);

export const computeUpgradeCost = (stateType, establishment, state) => {
  const upgrade = state[stateType][establishment];
  if (typeof upgrade.initialCost === "object") {
    const { initialCost: costs, level } = upgrade;
    return Object.entries(costs).reduce(
      (acc, [key, initialCost]) => ({
        ...acc,
        [key]: expUpgradeCost({ initialCost, level })
      }),
      {}
    );
  }
  return expUpgradeCost(upgrade);
};

export const computeUpdateWealthDelta = ({ city, upgrade }) => {
  const updates = Object.values(upgrade[SOCIAL]).filter(
    establishment =>
      establishment.update && establishment.level && establishment.update.wealth
  );
  const scalar = multiply(updates.map(({ update: { wealth } }) => wealth));
  return scalar * city[SOCIAL].workers;
};

export const computeSocialTaxAmount = ({ city }) => {
  const { [SOCIAL]: social, [NATIONAL]: national } = city;
  return Math.ceil(randomDeviation(national.taxrate * social.wealth, 0.05));
};
