import React, { useEffect, useRef, useState } from "react";
import { libraryEstablishment, totalStateMoney } from "./city-module";
import { randomDeviation, toDisplayString } from "./utils";
import {
  upgradeLevelCost,
  toPercentage,
  computeUpdateWealthDelta
} from "./city-utils";
import { SOCIAL, NATIONAL } from "./constants";

const CommunityCenter = ({
  city,
  onLevelEstablishment,
  onUpgradeEstablishment
}) => {
  return (
    <>
      <h3 children="Community Center" />
      <h4 children="upgrades" />
    </>
  );
};

const randomDeviationInterval = (ref, fn, ms) => {
  if (!ref.current) ref.current = {};
  const offset = ref.current.timestamp
    ? performance.now() - ref.current.timestamp
    : 0;
  clearInterval(ref.current);
  ref.current = setTimeout(
    (ref, fn, ms) => {
      fn();
      randomDeviationInterval(ref, fn, ms);
    },
    Math.max(0, randomDeviation(ms, 0.25) - offset),
    ref,
    fn,
    ms
  );
};

export const useCityInterval = ({ onSocialChange }) => {
  const socialChangeTimeout = useRef();
  const socialTaxTimeout = useRef();

  useEffect(() => {
    randomDeviationInterval(socialChangeTimeout, onSocialChange, 1e3);
  }, [onSocialChange]);
};

const City = ({
  city,
  upgrade,
  onTaxWorkers,
  onCreateLibrary,
  onUpgradeEstablishment,
  onLevelEstablishment
}) => {
  const [taxationDisabled, setTaxationDisabled] = useState(false);
  const handleTaxWorkers = city => {
    setTaxationDisabled(true);
    onTaxWorkers();
    setTimeout(() => setTaxationDisabled(false), city.workerTaxationCooldown);
  };

  const handleLevelEstablishment = establishment => {
    onLevelEstablishment(establishment);
  };

  const { [SOCIAL]: social, [NATIONAL]: national } = city;

  return (
    <section>
      <h2 className="title" children={city.name} />

      <h3 children="social" />
      <ul>
        <li children={["workers", social.workers].join(" ")} />
        <li
          children={["birth chance", toPercentage(social.birthchance)].join(
            " "
          )}
        />
        <li
          children={["death chance", toPercentage(social.deathchance)].join(
            " "
          )}
        />
        <li
          children={[
            "wealth",
            `(+~${toDisplayString(
              computeUpdateWealthDelta({ city, upgrade })
            )}/s)`,
            toDisplayString(social.wealth)
          ].join(" ")}
        />
      </ul>

      <h3 children="national" />
      <ul>
        <li children={["officials", city[NATIONAL].officials].join(" ")} />
        <li children={["wealth", city[NATIONAL].wealth].join(" ")} />
        <li
          children={["tax chance", toPercentage(city[NATIONAL].taxchance)].join(
            " "
          )}
        />
        <li
          children={["tax rate", toPercentage(city[NATIONAL].taxrate)].join(
            " "
          )}
        />
      </ul>
      <button
        onClick={() => handleTaxWorkers(city)}
        disabled={taxationDisabled}
        children={"Tax workers"}
      />

      <h3 children="capital" />
      <ul>
        <li children={["aristocrats", city.aristocrats].join(" ")} />
        <li
          children={["aristocracy wealth", city.aristocracyWealth].join(" ")}
        />
      </ul>
    </section>
  );
};

export default City;
