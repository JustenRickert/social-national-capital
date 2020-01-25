import React from "react";
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

const HospitalAchievement = props => {
  return (
    <>
      <h3>{props.name}</h3>

      <p>increases social taxes by {(100 * props.taxpercentage).toFixed(1)}%</p>
    </>
  );
};

const SwitchAchievement = props => {
  switch (props.name) {
    case "hospital":
      return <HospitalAchievement {...props} />;
    case "city":
      return <CityAchievement {...props} />;
    case "business":
      return <BusinessAchievement {...props} />;
    default:
      return props.name + " unlocked!";
  }
};

export const Achievement = ({ achievement, onChange }) => {
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
