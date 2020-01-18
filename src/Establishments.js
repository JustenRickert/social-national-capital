import React from "react";
import { SOCIAL } from "./constants";
import { When } from "./component-utils";

export const EstablishmentList = ({ upgrade }) => {
  return (
    <ul>
      {Object.entries(upgrade[SOCIAL])
        .filter(([, { level }]) => level)
        .map(([key, { level }]) => (
          <li>{[key, `(${level})`].join(" ")}</li>
        ))}
    </ul>
  );
};

const Establishments = props => {
  return (
    <section>
      <h2 children="establishments" />
      <When
        when={Object.values(props.upgrade[SOCIAL]).some(({ level }) => level)}
        or="None :("
      >
        <EstablishmentList {...props} />
      </When>
    </section>
  );
};

export default Establishments;
