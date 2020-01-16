import React, { useEffect, useRef, useState } from "react";
import { libraryEstablishment, totalStateMoney } from "./city-module";
import { randomDeviation } from "./utils";
import { upgradeLevelCost } from "./city-utils";
import { SOCIAL } from "./constants";

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

export const useCityInterval = ({ onSocialGrowth }) => {
  const socialGrowthTimeout = useRef();

  useEffect(() => {
    randomDeviationInterval(socialGrowthTimeout, onSocialGrowth, 1e3);
  }, [onSocialGrowth]);
};

const City = ({
  city,
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

  const establishmentsLength = Object.keys(city[SOCIAL].establishments).length;

  return (
    <div className="city">
      <h2 children={city.name} />

      <h3 children="national" />
      <ul>
        <li
          children={[
            "capital",
            city[SOCIAL].wealth,
            "+",
            `${city[SOCIAL].growth}/s`
          ].join(" ")}
        />
      </ul>
      <button
        onClick={() => handleTaxWorkers(city)}
        disabled={taxationDisabled}
        children={"Tax workers"}
      />

      <h3 children="social" />
      <ul>
        <li children={["workers", city[SOCIAL].workers].join(" ")} />
        <li children={["wealth", city[SOCIAL].wealth].join(" ")} />
      </ul>

      <h3 children="capital" />
      <ul>
        <li children={["aristocrats", city.aristocrats].join(" ")} />
        <li
          children={["aristocracy wealth", city.aristocracyWealth].join(" ")}
        />
      </ul>
    </div>
  );
};

export default City;
