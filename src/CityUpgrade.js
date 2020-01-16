import React from "react";
import { SOCIAL } from "./constants";
import { computeUpgradeCost } from "./city-upgrades";

export const UpgradeMenu = ({ city, upgrade, onPurchaseUpgrade }) => {
  const { [SOCIAL]: social } = upgrade;
  return (
    <div>
      <ul>
        {Object.keys(social).map(establishment => (
          <li
            onClick={() =>
              onPurchaseUpgrade({ stateType: SOCIAL, establishment })
            }
          >
            <button
              disabled={
                city[SOCIAL].wealth <
                computeUpgradeCost(SOCIAL, establishment, upgrade)
              }
              children={[
                establishment,
                computeUpgradeCost(SOCIAL, establishment, upgrade)
              ].join(" ")}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
