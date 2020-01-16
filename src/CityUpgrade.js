import React from "react";
import { SOCIAL } from "./constants";
import { computeUpgradeCost } from "./city-upgrades";

export const UpgradeMenu = ({ city, upgrade, onPurchaseUpgrade }) => {
  const { [SOCIAL]: social } = upgrade;
  return (
    <div>
      <ul>
        {Object.keys(social).map(name => (
          <li
            children={[name, computeUpgradeCost(SOCIAL, name, upgrade)].join(
              " "
            )}
          />
        ))}
      </ul>
    </div>
  );
};
