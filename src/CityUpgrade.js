import React from "react";
import { SOCIAL, NATIONAL } from "./constants";
import { computeUpgradeCost } from "./city-utils";
import { When } from "./component-utils";
import { toDisplayString } from "./utils";

const UpgradeLi = ({
  city,
  upgrade,
  stateType,
  establishmentKey,
  onPurchaseUpgrade
}) => {
  const upgradeCost = computeUpgradeCost(stateType, establishmentKey, upgrade);
  const disabled =
    typeof upgradeCost === "object"
      ? Object.entries(upgradeCost).every(
          ([type, cost]) => city[type].wealth < cost
        )
      : city[stateType].wealth < upgradeCost;
  return (
    <li>
      <button
        onClick={() =>
          onPurchaseUpgrade({
            stateType,
            establishmentKey
          })
        }
        disabled={disabled}
        children={[establishmentKey, `(${toDisplayString(upgradeCost)})`].join(
          " "
        )}
      />
    </li>
  );
};

export const EstablishmentUpgradeList = props => {
  const { stateType, upgrade } = props;
  const establishments = Object.entries(upgrade[stateType])
    .filter(([, establishment]) => !establishment.level)
    .map(([key]) => key);
  return (
    <ul>
      {establishments.map(establishmentKey => (
        <UpgradeLi
          key={establishmentKey}
          {...props}
          establishmentKey={establishmentKey}
        />
      ))}
    </ul>
  );
};

export const UpgradeMenu = ({ city, upgrade, onPurchaseUpgrade }) => {
  const { [SOCIAL]: socialUpgrades } = upgrade;
  return (
    <section>
      <h2 className="title" children="social upgrades" />

      <When
        when={Object.values(socialUpgrades).some(
          establishment => !establishment.level
        )}
        or="None :("
      >
        <EstablishmentUpgradeList
          stateType={SOCIAL}
          city={city}
          upgrade={upgrade}
          onPurchaseUpgrade={onPurchaseUpgrade}
        />
      </When>

      <h2 className="title" children="national upgrades" />

      <When when={true} or="None :(">
        <EstablishmentUpgradeList
          stateType={NATIONAL}
          city={city}
          upgrade={upgrade}
          onPurchaseUpgrade={onPurchaseUpgrade}
        />
      </When>
    </section>
  );
};
