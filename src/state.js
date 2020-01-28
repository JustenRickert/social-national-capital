import { createSlice, update, get } from "./state-util.js";
import { assert } from "./util";
// TODO CIRCULAR import
import { achievementConditions } from "./App.js";

const initialCityState = {
  social: {
    population: 1,

    deathrate: 10e3,
    birthrate: 8e3,
    wealthrate: 0.01,
    taxrate: 0.001,

    wealth: 0
  },
  national: {
    population: 0,
    wealth: 0
  },
  capital: {
    population: 0
  }
};

export const city = createSlice({
  name: "city",
  initialState: initialCityState,
  reducerMap: {
    exchangePopulation: (state, { payload: { from, to, amount = 1 } }) =>
      update(state, [
        [[from, "population"], population => population - amount],
        [[to, "population"], population => population + amount]
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
        get(state, [stateType, "wealth"]) + amount >= 0,
        "`wealth` cannot be made negative"
      );
      return update(state, [stateType, "wealth"], wealth => wealth + amount);
    }
  }
});

const initialAchievementState = {
  city: {
    name: "city",
    wealth: 0,
    taxpercentage: 0.01,
    taxtimeout: 30e3,

    achieved: false
  },
  hospital: {
    name: "hospital",
    taxpercentage: 0.01,
    achieved: false
  },
  firedepartment: {
    name: "firedepartment",
    achieved: false
  },
  election: {
    name: "election",
    achieved: false
  },
  government: {
    name: "government",
    achieved: false
  },
  defense: {
    name: "defense",
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
  }
};

export const achievement = createSlice({
  name: "achievement",
  initialState: initialAchievementState,
  reducerMap: {
    runAchievement: (city, { payload: state }) => {
      const ups = achievementConditions(state);
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
