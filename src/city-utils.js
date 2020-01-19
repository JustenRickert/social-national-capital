import { multiply, randomDeviation, range } from "./utils";
import { SOCIAL, NATIONAL } from "./constants";

export const upgradeLevelCost = upgrade =>
  upgrade.initialCost * Math.pow(10, upgrade.level);

export const computeSocialWealthMax = state =>
  state[SOCIAL].workers * state[SOCIAL].wealthPerWorker;

export const computeRemainingWealthPercentage = state => {
  const socialWealthMax = computeSocialWealthMax(state);
  const remainingPercentageCapital =
    (socialWealthMax - state[SOCIAL].wealth) / socialWealthMax;
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

export const updateTypeScalar = (establishment, name) => {
  const { level, update: { [name]: scalar = 0 } = {} } = establishment;
  return level * scalar;
};

const computeUpgradeWealthScalar = ({ city, upgrade }) => {
  const updates = Object.values(upgrade[SOCIAL]).filter(
    establishment =>
      establishment.update && establishment.level && establishment.update.wealth
  );
  const scalar = multiply(
    updates.map(establishment => updateTypeScalar(establishment, "wealth"))
  );

  return scalar;
};

export const computeUpdateWealthDelta = ({ city, upgrade }) => {
  const scalar = computeUpgradeWealthScalar({ city, upgrade });
  const remaining = computeRemainingWealthPercentage(city);
  return remaining * scalar * city[SOCIAL].workers;
};

export const computeOfficialMax = ({ city, upgrade }) => {
  const {
    [SOCIAL]: { workers },
    [NATIONAL]: { officialMax }
  } = city;
  const percentage = Object.values(upgrade[NATIONAL])
    .filter(({ level, additionalPercentage }) => level && additionalPercentage)
    .reduce(
      (percentage, { level, additionalPercentage }) =>
        range(level).reduce(
          percentage =>
            percentage + (1 - percentage) * additionalPercentage.officialMax,
          percentage
        ),
      officialMax
    );
  return Math.ceil(workers * percentage);
};

export const computeSocialTaxAmount = ({ city }) => {
  const { [SOCIAL]: social, [NATIONAL]: national } = city;
  return Math.ceil(randomDeviation(national.taxrate * social.wealth, 0.05));
};
