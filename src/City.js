import React from "react";

import { get, useInterval, randomDeviation } from "./state-util.js";
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
  const {
    social: {
      population,
      birthrate,
      birthpercentage,
      deathrate,
      deathpercentage
    }
  } = city;
  const birthamount = Math.ceil(
    randomDeviation(population * birthpercentage, 0.1)
  );
  const deathamount = Math.floor(
    randomDeviation(population * deathpercentage, 0.1)
  );

  useInterval(
    () => changePopulation({ stateType: "social", amount: birthamount }),
    birthrate
  );
  useInterval(
    () => changePopulation({ stateType: "social", amount: -deathamount }),
    deathrate
  );
};

export const useCitySocialWealthChangeInterval = ({ city, changeWealth }) => {
  useInterval(() => {
    const { population, wealth } = city.social;
    const growthrate = get(city, ["social", "wealthrate"]);
    const growth = growthrate * population;
    const taxpercentage = get(city, ["social", "taxpercentage"]);
    const tax = taxpercentage * growth;
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
          {(100 * social.taxpercentage).toFixed(1)}%/worker wealth
        </p>
      </section>

      <section>
        <h3>national</h3>
        <p>
          {national.population} bureaucrats{", "}
          {national.wealth.toFixed(2)}+{(100 * social.taxpercentage).toFixed(1)}
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
