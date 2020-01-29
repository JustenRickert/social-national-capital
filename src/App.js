import React, { useEffect } from "react";

import { city, achievement, achievmentConditionMap } from "./state.js";
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

const hitsAchievementCondition = (state, ach) => {
  if (ach.level) return false;
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

const toUpdateMultiplierKeyfn = (o, path = []) =>
  Object.entries(o).reduce((acc, [key, value]) => {
    if (typeof value === "object")
      acc.push(...toUpdateMultiplierKeyfn(value, path.concat(key)));
    else acc.push([path.concat(key), v => v * value]);
    return acc;
  }, []);

const achievementUpdates = (achievments, collected = []) =>
  Object.entries(achievments)
    .filter(([, { level, cityupdates }]) => level && cityupdates)
    .flatMap(([, { cityupdates }]) => toUpdateMultiplierKeyfn(cityupdates));

const App = ({ initialState, handleSave }) => {
  const [state, dispatch] = useSliceState({ city, achievement }, initialState);
  const updates = achievementUpdates(state.achievement);
  const cityWithAchievementAugments = update(state.city, updates);

  useInterval(handleSave, state, 10e3);

  useInterval(
    payload => dispatch(achievement.actions.runAchievementUnlock(payload)),
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

  const handleAchievementChange = ({ name, type, payload: { cost } = {} }) => {
    if (type === "level") {
      dispatch(achievement.actions.levelAchievement({ name, cost }));
      dispatch(achievement.actions.changeWealth({ name, amount: -cost }));
      return;
    }
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
          city={cityWithAchievementAugments}
          achievement={state.achievement}
          onChange={handleAchievementChange}
        />
      </div>
    </div>
  );
};

export default App;
