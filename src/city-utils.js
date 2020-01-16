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
