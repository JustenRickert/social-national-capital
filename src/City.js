import React from "react";

import { get, partition } from "./state-util.js";

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

export const City = ({ city, cityWithAugments, onChange }) => {
  return (
    <>
      <h2>City</h2>
      <section>
        <h3>social</h3>
        <button onClick={() => onChange({ type: "grow" })} children="clicker" />
        <p>
          {city.social.population} workers
          {", "}
          {city.social.wealth.toFixed(2)} wealth
          {", "}
          {cityWithAugments.social.wealthrate.toFixed(2)}-
          {(100 * cityWithAugments.social.taxrate).toFixed(1)}%/worker
        </p>
      </section>

      <section>
        <h3>national</h3>
        <p>{city.national.population} bureaucrats</p>
      </section>

      <section>
        <h3>capital</h3>
        <p>{city.capital.population} aristocrats</p>
      </section>
    </>
  );
};
