import { createSlice, update, get } from "./state-util.js";
import { assert } from "./util";
// TODO CIRCULAR import
import { achievementConditions } from "./App.js";

const initialCityState = {
  social: {
    population: 1,

    deathrate: 10e3,
    deathpercentage: 0.02,
    // time between births
    birthrate: 8e3,
    // percentage growth
    birthpercentage: 0.04,

    // wealth per second
    wealthpercentage: 0.01,
    // wealth per second transferred to national
    taxpercentage: 0.001,

    wealth: 1e6
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

// TODO: this method should be changed to an object and moved into achievements
// (see `cityupdates` key below)
export const achievmentConditionMap = {
  city: ["city", "social", "wealth", 1],
  school: ["city", "social", "wealth", 10],
  hospital: ["city", "social", "wealth", 50],
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

// `achivement.updates` is a nested object whose leaves correspond to scalars of
// the corresponding values in state. Multiples updates to the same key should
// are treated correctly since multiplication is associative.
const initialAchievementState = {
  city: {
    name: "city",
    wealth: 0,
    infrastructure: 0,
    taxpercentage: 0.01,
    taxtimeout: 30e3,
    upgradetimeout: 60e3,
    cityupdates: {
      social: {
        taxpercentage: 1.1,
        deathrate: 0.85
      }
    },
    level: 0
  },
  hospital: {
    name: "hospital",
    cityupdates: {
      social: {
        taxpercentage: 1.5,
        deathrate: 1.2,
        birthpercentage: 1.1
      }
    },
    level: 0
  },
  firedepartment: {
    name: "firedepartment",
    cityupdates: {
      social: {
        taxpercentage: 1.1,
        deathrate: 1.1,
        deathpercentage: 0.95
      }
    },
    level: 0
  },
  election: {
    name: "election",
    cityupdates: {
      social: {
        taxpercentage: 1.1
      }
    },
    level: 0
  },
  government: {
    name: "government",
    level: 0
  },
  defense: {
    name: "defense",
    level: 0
  },
  business: {
    name: "business",
    wealth: 0,
    investpercentage: 0.01,
    investtimeout: 30e3,

    level: 0
  },
  agriculture: {
    name: "agriculture",
    level: 0
  },
  coal: {
    name: "coal",
    level: 0
  },
  chemical: {
    name: "chemical",
    level: 0
  }
};

export const achievement = createSlice({
  name: "achievement",
  initialState: initialAchievementState,
  reducerMap: {
    levelAchievement: (state, { payload: { name, cost, amount = 1 } }) =>
      update(state, [
        [[name, "level"], level => level + amount],
        [[name, "infrastructure"], infrastructure => infrastructure + cost]
      ]),
    runAchievementUnlock: (achievments, { payload: state }) => {
      const ups = achievementConditions(state);
      if (!ups.length) return achievments;
      return update(
        achievments,
        ups.map(({ name }) => [[name, "level"], () => 1])
      );
    },
    changeWealth: (state, { payload: { name, amount } }) => {
      console.log("what", get(state, [name]), amount);
      assert("wealth" in get(state, [name]), "must have `wealth` to change it");
      assert(
        get(state, [name, "wealth"]) + amount > 0,
        "`wealth` cannot be made negative"
      );
      return update(state, [name, "wealth"], wealth => wealth + amount);
    }
  }
});
