import React, { Fragment } from "react";
import { SOCIAL, NATIONAL } from "./constants";
import { When } from "./component-utils";
import { updateTypeScalar, toPercentage } from "./city-utils";

export const EstablishmentList = ({ type, upgrade }) => {
  const wealthScalar = key => updateTypeScalar(upgrade[type][key], "wealth");
  return (
    <ul>
      {Object.entries(upgrade[type])
        .filter(([, { level }]) => level)
        .map(([key, { level }]) => {
          const wealth = wealthScalar(key);
          return (
            <li key={key}>
              <h4>{[key, `(${level})`].join(" ")}</h4>
              <ul>
                {Boolean(wealth) && (
                  <li
                    children={["wealth", `+${toPercentage(wealth)}/s`].join(
                      " "
                    )}
                  />
                )}
              </ul>
            </li>
          );
        })}
    </ul>
  );
};

const Establishments = props => {
  const { upgrade } = props;
  return (
    <section>
      <h2 children="establishments" />
      {[SOCIAL, NATIONAL].map(type => (
        <Fragment key={type}>
          <h3 children={type} />
          <When
            when={Object.values(upgrade[type]).some(({ level }) => level)}
            or="None :("
          >
            <EstablishmentList {...props} type={type} />
          </When>
        </Fragment>
      ))}
    </section>
  );
};

export default Establishments;
