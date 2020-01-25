import React, { Fragment } from "react";
import { ADMINISTRATION, SOCIAL, NATIONAL, PROPAGANDA } from "./constants";
import { When } from "./component-utils";
import {
  updateTypeScalar,
  toPercentage,
  computeUpgradeCost
} from "./city-utils";
import { toDisplayString } from "./utils";

const AdministrationPowers = ({
  city: { [NATIONAL]: national },
  establishmentKey,
  onEstablishmentEvent
}) => {
  if (establishmentKey !== ADMINISTRATION) return null;
  return (
    <li>
      <h5>{ADMINISTRATION} powers</h5>
      <button
        disabled={!national.officials}
        onClick={() =>
          onEstablishmentEvent({
            type: PROPAGANDA
          })
        }
        children="propaganda button"
      />
    </li>
  );
};

const EstablishmentList = ({
  city,
  city: { [SOCIAL]: social },
  type,
  upgrade,
  onEstablishmentEvent
}) => {
  const upgradeCost = key => computeUpgradeCost(type, key, upgrade);
  const wealthScalar = key => updateTypeScalar(upgrade[type][key], "wealth");
  return (
    <ul>
      {Object.entries(upgrade[type])
        .filter(([, { level }]) => level)
        .map(([establishmentKey, { level }]) => {
          const wealth = wealthScalar(establishmentKey);
          const upgrade = upgradeCost(establishmentKey);
          return (
            <li key={establishmentKey}>
              <h4>{[establishmentKey, `(${level})`].join(" ")}</h4>
              <ul>
                <AdministrationPowers
                  city={city}
                  onEstablishmentEvent={onEstablishmentEvent}
                  establishmentKey={establishmentKey}
                />
                {social.wealth >= upgrade && (
                  <li>
                    <button children={"Upgrade"} />
                    {toDisplayString(upgrade)}
                  </li>
                )}
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
