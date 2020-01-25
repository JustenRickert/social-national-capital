import * as Util from "./state-util.js";

describe("state utils", () => {
  it("turns reducer map into a keyed product function of the reducers", () => {
    const reducer = Util.combineReducers({});
    expect(typeof reducer).toBe("function");
  });

  it("creates a reducer", () => {
    const one = state => !state;
    const r = Util.combineReducers({
      one
    });
    const state = { one: true };
    expect(r(state)).not.toBe(state);
    expect(r(state).one).not.toBe(state.one);
  });

  it("create slice util", () => {
    const slice = Util.createSlice({
      name: "test",
      reducerMap: {
        test: (state, action) => state + action
      }
    });
    expect(typeof slice).toBe("object");
    expect(typeof slice.reducer).toBe("function");
    expect(typeof slice.actions).toBe("object");
    expect(typeof slice.actions.test).toBe("function");
  });

  it("slice initializes own state", () => {
    const slice = Util.createSlice({
      name: "test",
      initialState: "TEST INITIAL STATE",
      reducerMap: {}
    });

    const initialState = slice.reducer();
    expect(initialState).toBe("TEST INITIAL STATE");
  });

  it("has updater util", () => {
    const state = { test: false };
    const { reducer, actions } = Util.createSlice({
      reducerMap: {
        test: Util.makeUpdateReducer("test", test => !test)
      }
    });
    const newState = reducer(state, actions.test());
    expect(state.test).not.toBe(newState.test);
  });
});
