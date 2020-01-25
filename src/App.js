import React, { useRef } from "react";

import {
  combineReducers,
  createSlice,
  update,
  useSliceState,
  useInterval,
  partition,
  get,
  sampleBetween
} from "./state-util.js";

import "./app.css";

const initialCityState = {
  social: {
    population: 1,
    classMobility: 0.01,

    deathrate: 10e3,
    birthrate: 8e3,
    wealthrate: 0.01,
    wealth: 0
  },
  national: {
    population: 0,
    classMobility: 0
  },
  capital: {
    population: 0,
    classMobility: 0
  }
};

const city = createSlice({
  name: "city",
  initialState: initialCityState,
  reducerMap: {
    exchangePopulation: (state, { payload: { from, to } }) =>
      update(state, [
        [[from, "population"], population => population - 1],
        [[to, "population"], population => population + 1]
      ]),
    incPopulation: (state, { payload: stateType }) =>
      update(state, [stateType, "population"], population => population + 1),
    changePopulation: (state, { payload: { stateType, amount } }) =>
      update(state, [stateType, "population"], population =>
        Math.max(0, population + amount)
      ),
    incWealth: (state, { payload: { multiplier } }) =>
      update(
        state,
        ["social", "wealth"],
        wealth => wealth + multiplier * state.social.population
      )
  }
});

const initialAchievementState = {
  updates: {
    city: {
      name: "city",
      plural: "cities",
      achieved: false,
      condition: ["social", "wealth", { type: "gt", amount: 1 }],
      augmentation: ["social", "wealthrate", 1.5]
    },
    business: {
      name: "business",
      plural: "businesses",
      achieved: false,
      condition: ["social", "wealth", { type: "gt", amount: 1000 }],
      augmentation: ["social", "wealth", 1.5]
    }
  }
};

const achievement = createSlice({
  name: "achievement",
  initialState: initialAchievementState,
  reducerMap: {
    runAchievement: (state, { payload: { city } }) => {
      const ups = achiementCondition(city, state.updates);
      if (!ups.length) return state;
      return update(
        state,
        ups.map(({ name }) => [["updates", name, "achieved"], () => true])
      );
    }
  }
});

const achiementCondition_single = (city, update) => {
  if (update.achieved) return false;
  const [key, [arithmetic]] = partition(
    update.condition,
    key => typeof key === "string"
  );
  switch (arithmetic.type) {
    case "gt":
      return get(city, key) > arithmetic.amount;
    default:
      throw new Error();
  }
};

const achiementCondition = (city, updates) =>
  Object.values(updates).filter(update =>
    achiementCondition_single(city, update)
  );

const achievementAugmentation = (city, updates, filterKeys = []) => {
  const augmentations = Object.values(updates)
    .filter(({ achieved }) => achieved)
    .map(update =>
      partition(update.augmentation, key => typeof key === "string")
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

const Achievement = ({ achievement: { updates } }) => {
  return (
    <>
      <h2>Achievment</h2>

      <section>
        <ul>
          {Object.values(updates)
            .filter(({ achieved }) => achieved)
            .map(({ name }) => (
              <li key={name}>{name}</li>
            ))}
        </ul>
      </section>
    </>
  );
};

const App = () => {
  const [state, dispatch] = useSliceState({ city, achievement });
  useInterval(
    payload => dispatch(achievement.actions.runAchievement(payload)),
    { city: state.city },
    15e3
  );
  const cityWithAchievementUpdates = update(
    state.city,
    achievementAugmentation(state.city, state.achievement.updates)
  );
  useInterval(
    ({}) => {
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
        city.actions.incWealth({
          multiplier: get(cityWithAchievementUpdates, ["social", "wealthrate"])
        })
      ),
    1000
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
  return (
    <div className="app">
      <div className="panel">
        <h2>City</h2>
        <section>
          <h3>social</h3>
          <button
            onClick={() => dispatch(city.actions.incPopulation("social"))}
            children="clicker"
          />
          <p>
            {state.city.social.population} workers
            {", "}
            {state.city.social.wealth.toFixed(2)} wealth
          </p>
        </section>

        <section>
          <h3>national</h3>
          <p>{state.city.national.population} bureaucrats</p>
        </section>

        <section>
          <h3>capital</h3>
          <p>{state.city.capital.population} aristocrats</p>
        </section>
      </div>

      <div className="panel">
        <Achievement achievement={state.achievement} />
      </div>
    </div>
  );
};

export default App;
