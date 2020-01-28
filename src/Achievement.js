import React from "react";
import { useTimeout } from "./state-util.js";

const ElectionAchievment = ({ onChange, ...props }) => {
  const { waiting, reset } = useTimeout(5e3);
  if (!props.achieved) return null;
  return (
    <section>
      <h4>{props.name}</h4>

      <button
        disabled={waiting}
        onClick={() => {
          reset();
          onChange({ name: props.name, type: "holdelection" });
        }}
      >
        election
      </button>
    </section>
  );
};

const CityAchievement = ({ onChange, election, ...props }) => {
  const { waiting, reset } = useTimeout(props.taxtimeout);
  if (!props.achieved) return null;
  return (
    <li>
      <h3>{props.name}</h3>

      <button
        disabled={waiting}
        onClick={() => {
          reset();
          onChange({ name: props.name, type: "tax" });
        }}
      >
        tax {Math.floor(100 * props.taxpercentage)}%
      </button>

      <section>{props.wealth.toFixed(2)} wealth</section>

      <ElectionAchievment onChange={onChange} {...election} />
    </li>
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
    case "business":
      return <BusinessAchievement {...props} />;
    case "city":
    case "election":
      return null;
    default:
      return props.name + " unlocked!";
  }
};

export const Achievement = ({ achievement, onChange }) => {
  return (
    <>
      <h2>Achievment</h2>

      <section>
        <ul className="achievement-list">
          <CityAchievement
            {...achievement.city}
            onChange={onChange}
            election={achievement.election}
          />
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
