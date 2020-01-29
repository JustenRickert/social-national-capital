import React from "react";
import { useTimeout, partition, get, useTimeoutRecord } from "./state-util.js";
import { toPercentage, toCount, toMoney } from "./format-utils";
import { achievmentConditionMap } from "./state.js";

const ElectionAchievment = ({ onChange, ...props }) => {
  const { waiting, reset } = useTimeout(5e3);
  if (!props.level) return null;
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

const last = xs => xs[xs.length - 1];

const achievementLevelCost = props =>
  Math.exp(props.level) * last(achievmentConditionMap[props.name]);

const isAchievementLevelCostMet = props =>
  props.wealth > achievementLevelCost(props);

const CityAchievement = ({ onChange, election, city, ...props }) => {
  const { waiting, reset } = useTimeoutRecord({
    tax: props.taxtimeout,
    level: props.upgradetimeout
  });
  // const { waiting, reset } = useTimeout(props.taxtimeout);
  if (!props.level) return null;
  return (
    <li>
      <h3>{props.name}</h3>

      <button
        disabled={waiting.tax}
        onClick={() => {
          reset("tax");
          onChange({ name: props.name, type: "tax" });
        }}
      >
        tax {toPercentage(props.taxpercentage)}%
      </button>

      <button
        disabled={waiting.level || !isAchievementLevelCostMet(props)}
        onClick={() => {
          reset("level");
          onChange({
            name: props.name,
            type: "level",
            payload: { cost: achievementLevelCost(props) }
          });
        }}
      >
        add infrastructure {toCount(achievementLevelCost(props))}
      </button>

      <section>
        <ul>
          <li>level: {toCount(props.level)}</li>
          <li>wealth: {toMoney(props.wealth)}</li>
          <li>infrastructure: {toMoney(props.infrastructure)} </li>
        </ul>
      </section>

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

      <p>
        increases social taxes by{" "}
        {props.cityupdates.social.taxpercentage.toFixed(1)}%
      </p>
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

export const Achievement = ({ city, achievement, onChange }) => {
  return (
    <>
      <h2>Achievment</h2>

      <section>
        <ul className="achievement-list">
          <CityAchievement
            {...achievement.city}
            city={city}
            onChange={onChange}
            election={achievement.election}
          />
          {Object.values(achievement)
            .filter(({ level }) => level)
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
