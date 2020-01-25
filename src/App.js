import React, { useRef } from "react";

import {
  combineReducers,
  createSlice,
  update,
  useSliceState,
  useInterval,
  partition,
  get,
  sampleBetween,
  useTimeout
} from "./state-util.js";
import { assert } from "./util";

import "./app.css";

const initialCityState = {
  social: {
    population: 1,

    deathrate: 10e3,
    birthrate: 8e3,
    wealthrate: 0.01,
    wealth: 0
  },
  national: {
    population: 0,
    treasury: 0
  },
  capital: {
    population: 0
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
      ),
    changeWealth: (state, { payload: { stateType, amount } }) => {
      assert(
        get(state, [stateType, "wealth"]) + amount > 0,
        "`wealth` cannot be made negative"
      );
      return update(state, [stateType, "wealth"], wealth => wealth + amount);
    }
  }
});

const achievmentConditionMap = {
  city: ["city", "social", "wealth", 1],

  election: ["achievement", "city", "wealth", 10],
  defense: ["achievement", "city", "wealth", 100],

  business: ["city", "social", "wealth", 1],
  agriculture: ["achievement", "business", "wealth", 10],
  coal: ["achievement", "business", "wealth", 50],
  oil: ["achievement", "business", "wealth", 100],
  chemical: ["achievement", "business", "wealth", 150]
};

const achievementAugmentationMap = {
  city: ["social", "wealthrate", 1.5],
  business: ["social", "wealthrate", 1.5]
};

const initialAchievementState = {
  city: {
    name: "city",
    wealth: 0,
    taxpercentage: 0.01,
    taxtimeout: 30e3,

    achieved: false
  },
  business: {
    name: "business",
    wealth: 0,
    investpercentage: 0.01,
    investtimeout: 30e3,

    achieved: false
  },
  agriculture: {
    name: "agriculture",
    achieved: false
  },
  coal: {
    name: "coal",
    achieved: false
  },
  chemical: {
    name: "chemical",
    achieved: false
  },
  election: {
    name: "election",
    achieved: false
  },
  defense: {
    name: "defense",
    achieved: false
  }
};

const achievement = createSlice({
  name: "achievement",
  initialState: initialAchievementState,
  reducerMap: {
    runAchievement: (city, { payload: state }) => {
      const ups = achiementCondition(state);
      if (!ups.length) return city;
      return update(
        city,
        ups.map(({ name }) => [[name, "achieved"], () => true])
      );
    },
    changeWealth: (state, { payload: { name, amount } }) => {
      assert("wealth" in get(state, [name]), "must have `wealth` to change it");
      assert(
        get(state, [name, "wealth"]) + amount > 0,
        "`wealth` cannot be made negative"
      );
      return update(state, [name, "wealth"], wealth => wealth + amount);
    }
  }
});

const achiementCondition_single = (state, ach) => {
  if (ach.achieved) return false;
  const [key, [amount]] = partition(
    achievmentConditionMap[ach.name],
    key => typeof key === "string"
  );
  return get(state, key) > amount;
};

const achiementCondition = state =>
  Object.values(state.achievement).filter(ach =>
    achiementCondition_single(state, ach)
  );

const achievementAugmentation = (achievment, filterKeys = []) => {
  const augmentations = Object.values(achievment)
    .filter(({ achieved }) => achieved)
    .map(update =>
      partition(
        achievementAugmentationMap[update.name],
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

const CityAchievement = ({ onChange, ...ach }) => {
  const { waiting, reset } = useTimeout(ach.taxtimeout);
  return (
    <>
      <h3>{ach.name}</h3>

      <button
        disabled={waiting}
        onClick={() => {
          reset();
          onChange({ name: ach.name, type: "tax" });
        }}
      >
        tax {Math.floor(100 * ach.taxpercentage)}%
      </button>

      <section>{ach.wealth.toFixed(2)} wealth</section>
    </>
  );
};

const BusinessAchievement = ({ onChange, ...ach }) => {
  const { waiting, reset } = useTimeout(ach.investtimeout);
  return (
    <>
      <h3>{ach.name}</h3>

      <button
        disabled={waiting}
        onClick={() => {
          reset();
          onChange({ name: ach.name, type: "invest" });
        }}
      >
        tax {Math.floor(100 * ach.investpercentage)}%
      </button>

      <section>{ach.wealth.toFixed(2)} wealth</section>
    </>
  );
};

const SwitchAchievement = ({ onChange, ...ach }) => {
  switch (ach.name) {
    case "city":
      return <CityAchievement onChange={onChange} {...ach} />;
    case "business":
      return <BusinessAchievement onChange={onChange} {...ach} />;
    default:
      return ach.name + " unlocked!";
  }
};

const Achievement = ({ achievement, onChange }) => {
  return (
    <>
      <h2>Achievment</h2>

      <section>
        <ul>
          {Object.values(achievement)
            .filter(({ achieved }) => achieved)
            .map(ach => (
              <li key={ach.name}>
                <SwitchAchievement {...ach} onChange={onChange} />
              </li>
            ))}
        </ul>
      </section>
    </>
  );
};

const App = () => {
  const [state, dispatch] = useSliceState({ city, achievement });
  const cityWithAchievementAugments = update(
    state.city,
    achievementAugmentation(state.city, state.achievement)
  );
  useInterval(
    payload => dispatch(achievement.actions.runAchievement(payload)),
    state,
    1.5e3
  );
  useInterval(() => {
    dispatch(
      city.actions.incWealth({
        multiplier: get(cityWithAchievementAugments, ["social", "wealthrate"])
      })
    );
  }, 1000);
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
        <Achievement
          achievement={state.achievement}
          onChange={({ name, type }) => {
            switch (`${name}/${type}`) {
              case "business/invest":
                {
                  const change =
                    state.achievement[name].investpercentage *
                    state.city.social.wealth;
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
                    state.city.social.wealth;
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
          }}
        />
      </div>
    </div>
  );
};

export default App;
