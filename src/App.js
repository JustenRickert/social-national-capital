import React from "react";

import { city, achievement } from "./state.js";
import { City } from "./City.js";
import { Achievement } from "./Achievement.js";
import {
  update,
  useSliceState,
  useInterval,
  partition,
  get
} from "./state-util.js";
import { assert } from "./util.js";
import "./app.css";

const and = (...conditions) => ({ type: "and", value: conditions });

const achievmentConditionMap = {
  city: ["city", "social", "wealth", 1],
  hospital: ["city", "social", "wealth", 0],
  firedepartment: ["city", "social", "wealth", 100],

  election: ["achievement", "city", "wealth", 10],
  government: ["city", "national", "population", 10],
  defense: and(
    ["achievement", "city", "wealth", 100],
    ["city", "social", "wealth", 1000]
  ),

  business: ["city", "social", "wealth", 1],
  agriculture: ["achievement", "business", "wealth", 10],
  coal: ["achievement", "business", "wealth", 50],
  oil: ["achievement", "business", "wealth", 100],
  chemical: ["achievement", "business", "wealth", 150]
};

const achievementAugmentationMap = {
  city: ["social", "wealthrate", 1.5],
  business: ["social", "wealthrate", 1.5],
  hospital: ["social", "taxrate", 1.5]
};

const hitsAchievementCondition = (state, ach) => {
  if (ach.achieved) return false;
  if (!achievmentConditionMap[ach.name]) return false;
  switch (achievmentConditionMap[ach.name].type) {
    case "and": {
      return achievmentConditionMap[ach.name].value.every(keys => {
        const [key, [amount]] = partition(keys, key => typeof key === "string");
        return get(state, key) >= amount;
      });
    }
    default:
      break;
  }
  const [key, [amount]] = partition(
    achievmentConditionMap[ach.name],
    key => typeof key === "string"
  );
  return get(state, key) >= amount;
};

export const achievementConditions = state =>
  Object.values(state.achievement).filter(ach =>
    hitsAchievementCondition(state, ach)
  );

const achievementAugmentation = (achievment, filterKeys = []) => {
  const augmentations = Object.values(achievment)
    .filter(
      ({ name, achieved }) => achieved && achievementAugmentationMap[name]
    )
    .map(({ name }) =>
      partition(
        achievementAugmentationMap[name],
        key => typeof key === "string"
      )
    )
    .map(([key, [multiplier]]) => ({
      key,
      multiplier
    }))
    .filter(({ key }) => filterKeys.every((fk, i) => key[i] === fk));
  return augmentations.map(({ key, multiplier }) => [
    key,
    value => multiplier * value
  ]);
};

const App = () => {
  const [state, dispatch] = useSliceState({ city, achievement });
  const augments = achievementAugmentation(state.achievement);
  const cityWithAchievementAugments = update(state.city, augments);

  useInterval(
    payload => dispatch(achievement.actions.runAchievement(payload)),
    state,
    1.5e3
  );
  useInterval(() => {
    const { population } = state.city.social;
    const growthrate = get(cityWithAchievementAugments, [
      "social",
      "wealthrate"
    ]);
    const growth = growthrate * population;
    const taxrate = get(cityWithAchievementAugments, ["social", "taxrate"]);
    dispatch(
      city.actions.changeWealth({
        stateType: "social",
        amount: (1 - taxrate) * growth
      })
    );
    dispatch(
      city.actions.changeWealth({
        stateType: "national",
        amount: taxrate * growth
      })
    );
  }, 1000);
  useInterval(
    () => {
      const isSocialMobile = state.city.social.population > 2;
      if (isSocialMobile)
        ["national", "captial"].forEach(to => {
          if (Math.random() < state.city.social.classMobility)
            city.actions.exchangePopulation({ from: "social", to });
        });
    },
    {},
    3e3
  );
  useInterval(
    () =>
      dispatch(
        city.actions.changePopulation({ stateType: "social", amount: 1 })
      ),
    state.city.social.birthrate
  );
  useInterval(
    () =>
      dispatch(
        city.actions.changePopulation({ stateType: "social", amount: -1 })
      ),
    state.city.social.deathrate
  );

  const handleAchievementChange = ({ name, type }) => {
    switch (`${name}/${type}`) {
      case "election/holdelection":
        assert(
          state.city.social.population - 1 > 0,
          "TODO: this shouldn't be able to happen"
        );
        dispatch(
          city.actions.exchangePopulation({
            from: "social",
            to: "national"
          })
        );
        break;
      case "business/invest":
        {
          const change =
            state.achievement[name].investpercentage * state.city.social.wealth;
          [
            city.actions.changeWealth({
              stateType: "social",
              amount: -change
            }),
            achievement.actions.changeWealth({ name, amount: change })
          ].forEach(dispatch);
        }
        break;
      case "city/tax":
        {
          const change =
            state.achievement[name].taxpercentage * state.city.social.wealth;
          [
            city.actions.changeWealth({
              stateType: "social",
              amount: -change
            }),
            achievement.actions.changeWealth({ name, amount: change })
          ].forEach(dispatch);
        }
        break;
      default:
        console.error({ name, type });
        throw new Error("not implemented");
    }
  };

  const handleCityChange = ({ type }) => {
    switch (type) {
      case "grow":
        dispatch(city.actions.incPopulation("social"));
        break;
      default:
        console.error({ type });
        throw new Error("not implemented");
    }
  };

  return (
    <div className="app">
      <div className="panel">
        <City
          city={state.city}
          cityWithAugments={cityWithAchievementAugments}
          onChange={handleCityChange}
        />
      </div>

      <div className="panel">
        <Achievement
          achievement={state.achievement}
          onChange={handleAchievementChange}
        />
      </div>
    </div>
  );
};

export default App;
