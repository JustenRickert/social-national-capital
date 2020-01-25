import React from "react";

const first = xs => xs[0];

const rest = xs => xs.slice(1);

const complement = p => (...args) => !p(...args);

export const partition = (xs, p) => {
  const index = xs.findIndex(complement(p));
  return [xs.slice(0, index), xs.slice(index)];
};

export const get = (state, keypath, default_ = undefined) => {
  if (typeof keypath === "string") keypath = keypath.split(".");
  if (keypath.length === 1)
    return first(keypath) in state ? state[keypath] : default_;
  return get(state[first(keypath)], rest(keypath), default_);
};

const updateAll = (state, keyFns) =>
  keyFns.reduce((state, [key, fn]) => update(state, key, fn), state);

export const update = (state, key, fn) => {
  if (!fn) return updateAll(state, key);
  if (typeof key === "string") key = key.split(".");
  if (!key.length) return fn(state);
  return {
    ...state,
    [first(key)]: update(state[first(key)], rest(key), fn)
  };
};

export const createSlice = ({ name, reducerMap, initialState }) => {
  const actions = Object.keys(reducerMap).reduce(
    (actions, key) =>
      Object.assign(actions, {
        [key]: payload => ({ sliceName: name, type: key, payload })
      }),
    {}
  );
  const reducer = (state = initialState, action = undefined) => {
    if (!action || action.sliceName !== name) return state;
    return reducerMap[action.type](state, action);
  };
  return {
    actions,
    reducer
  };
};

export const combineReducers = reducerMap => (state, action) =>
  Object.entries(reducerMap).reduce(
    (acc, [key, reducer]) =>
      Object.assign(acc, {
        [key]: reducer(state && state[key], action)
      }),
    {}
  );

export const useSliceState = (sliceMap, initialState = undefined) => {
  const reducer = React.useRef(
    combineReducers(
      Object.entries(sliceMap).reduce(
        (reducerMap, [name, { reducer }]) =>
          Object.assign(reducerMap, { [name]: reducer }),
        {}
      )
    )
  );
  const initialStateRef = React.useRef(initialState || reducer.current());
  return React.useReducer(reducer.current, initialStateRef.current);
};

export const randomUnitSegment = () => 2 * (Math.random() - 1 / 2);

export const randomDeviation = (n, maxOffset) =>
  n + randomUnitSegment() * maxOffset * n;

const randomDeviationInterval = (ref, fn, ms, args) => {
  if (!ref.current) ref.current = {};
  const timestamp = performance.now();
  if (!ref.current.timestamp) ref.current.timestamp = timestamp;
  const offset = timestamp - ref.current.timestamp;
  clearInterval(ref.current.timeout);
  ref.current.timeout = setTimeout(
    (ref, fn, ms) => {
      fn(args);
      ref.current.timestamp = performance.now();
      randomDeviationInterval(ref, fn, ms, args);
    },
    randomDeviation(ms - offset, 0.25),
    ref,
    fn,
    ms
  );
};

export const useInterval = (fn, args, ms) => {
  ms = ms || args;
  const timeout = React.useRef();
  React.useEffect(() => {
    randomDeviationInterval(timeout, fn, ms, args);
    return () => {
      clearInterval(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fn, ms, ...(ms && Object.values(args))]);
};

export const useTimeout = ms => {
  const [waiting, reset] = React.useState(false);
  return {
    waiting,
    reset: () => {
      reset(true);
      setTimeout(() => reset(false), ms);
    }
  };
};

export const sampleBetween = (lhs, rhs) => {
  const least = Math.min(lhs, rhs);
  const dist = rhs + lhs;
  return least + Math.random() * dist;
};
