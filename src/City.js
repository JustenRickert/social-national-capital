import React from "react";

import { get, useInterval } from "./state-util.js";
import { assert } from "./util.js";

const runKeyfn = (state, [key, fn]) => fn(get(state, key));

const bucket = (xs, keyfn) =>
  xs.reduce((acc, x) => {
    const entry = acc[keyfn(x)] || [];
    entry.push(x);
    return Object.assign(acc, {
      [keyfn(x)]: entry
    });
  }, {});

const tap = x => (console.log(x), x);

export const usePopulationGrowth = ({}) => {};

export const useCityLifeAndDeathInterval = ({ city, changePopulation }) => {
  useInterval(
    () => changePopulation({ stateType: "social", amount: 1 }),
    city.social.birthrate
  );
  useInterval(
    () => changePopulation({ stateType: "social", amount: -1 }),
    city.social.deathrate
  );
};

export const useCitySocialWealthChangeInterval = ({ city, changeWealth }) => {
  useInterval(() => {
    const { population, wealth } = city.social;
    const growthrate = get(city, ["social", "wealthrate"]);
    const growth = growthrate * population;
    const taxrate = get(city, ["social", "taxrate"]);
    const tax = taxrate * growth;
    changeWealth({
      stateType: "social",
      amount: growth - tax
    });
    changeWealth({
      stateType: "national",
      amount: tax
    });
  }, 1000);
};

export const City = ({ city, onChange }) => {
  const { social, national, capital } = city;
  return (
    <>
      <h2>City</h2>
      <section>
        <h3>social</h3>
        <button onClick={() => onChange({ type: "grow" })} children="clicker" />
        <p>
          {social.population} workers
          {", "}
          {social.wealth.toFixed(2)}+{social.wealthrate.toFixed(2)}-
          {(100 * social.taxrate).toFixed(1)}%/worker wealth
        </p>
      </section>

      <section>
        <h3>national</h3>
        <p>
          {national.population} bureaucrats{", "}
          {national.wealth.toFixed(2)}+{(100 * social.taxrate).toFixed(1)}
          %/worker treasury
        </p>
      </section>

      <section>
        <h3>capital</h3>
        <p>{capital.population} aristocrats</p>
      </section>
    </>
  );
};
