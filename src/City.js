import React from "react";

import { get, useInterval, randomDeviation } from "./state-util.js";
import { assert } from "./util.js";
import { toCount, toMoney, toPercentage } from "./format-utils.js";

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
    const growthrate = get(city, ["social", "wealthpercentage"]);
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

const socialStatsList = [
  { key: "population", fn: toCount },
  { key: "wealth", fn: toMoney },
  { key: "wealthpercentage", display: "wealth growth", fn: toPercentage },
  { key: "taxpercentage", display: "tax", fn: toPercentage }
];

const CitySocial = ({ city, onChange }) => {
  const { social, national, capital } = city;

  return (
    <section>
      <h3>social</h3>
      <button onClick={() => onChange({ type: "grow" })} children="clicker" />
      <ul>
        {socialStatsList.map(({ key, display, fn }) => (
          <li key={key}>{[display || key, fn(social[key])].join(": ")}</li>
        ))}
      </ul>
    </section>
  );
};

const nationalStatsList = [
  { key: "population", display: "bureaucrats", fn: toCount },
  { key: "wealth", fn: toMoney }
];

const CityNational = ({ city, onChange }) => {
  const { national } = city;
  return (
    <section>
      <h3>national</h3>
      <ul>
        {nationalStatsList.map(({ key, display, fn }) => (
          <li key={key}>{[display || key, fn(national[key])].join(": ")}</li>
        ))}
      </ul>
    </section>
  );
};

export const City = ({ city, onChange }) => {
  const { social, national, capital } = city;
  return (
    <>
      <h2>City</h2>
      <CitySocial city={city} onChange={onChange} />
      <CityNational city={city} onChange={onChange} />

      <section>
        <h3>capital</h3>
        <p>{capital.population} aristocrats</p>
      </section>
    </>
  );
};
