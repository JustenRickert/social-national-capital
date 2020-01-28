import React, { useEffect } from "react";

import { city, achievement } from "./state.js";
import {
  City,
  useCityLifeAndDeathInterval,
  useCitySocialWealthChangeInterval
} from "./City.js";
import { Achievement } from "./Achievement.js";
import {
  update,
  useSliceState,
  useInterval,
  partition,
  get,
  readLocalStorage,
  writeLocalStorage,
  wrapDispatch,
  composeFn
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
  defense: ["achievement", "city", "wealth", 100],
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
  if (!achievmentConditionMap[ach.name].type) {
    const [key, [amount]] = partition(
      achievmentConditionMap[ach.name],
      key => typeof key === "string"
    );
    return get(state, key) >= amount;
  }
  switch (achievmentConditionMap[ach.name].type) {
    case "and": {
      return achievmentConditionMap[ach.name].value.every(keys => {
        const [key, [amount]] = partition(keys, key => typeof key === "string");
        return get(state, key) >= amount;
      });
    }
    default:
      throw new Error("not implemented");
  }
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

const App = ({ initialState, handleSave }) => {
  const [state, dispatch] = useSliceState({ city, achievement }, initialState);
  const augments = achievementAugmentation(state.achievement);
  const cityWithAchievementAugments = update(state.city, augments);

  useInterval(
    payload => dispatch(achievement.actions.runAchievement(payload)),
    state,
    1.5e3
  );

  useCitySocialWealthChangeInterval({
    city: cityWithAchievementAugments,
    changeWealth: composeFn(dispatch, city.actions.changeWealth)
  });

  useCityLifeAndDeathInterval({
    city: cityWithAchievementAugments,
    changePopulation: composeFn(dispatch, city.actions.changePopulation)
  });

  const handleAchievementChange = ({ name, type }) => {
    switch (`${name}/${type}`) {
      case "election/holdelection":
        assert(
          cityWithAchievementAugments.social.population - 1 > 0,
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
            state.achievement[name].investpercentage *
            cityWithAchievementAugments.social.wealth;
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
            state.achievement[name].taxpercentage *
            cityWithAchievementAugments.social.wealth;
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
      <button onClick={() => handleSave(state)} children="save" />
      <div className="panel">
        <City city={cityWithAchievementAugments} onChange={handleCityChange} />
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
