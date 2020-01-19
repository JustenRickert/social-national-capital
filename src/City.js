import React, { useEffect, useRef } from "react";
import { randomDeviation, toDisplayString } from "./utils";
import {
  toPercentage,
  computeUpdateWealthDelta,
  computeOfficialMax
} from "./city-utils";
import { SOCIAL, NATIONAL } from "./constants";

const randomDeviationInterval = (ref, fn, ms) => {
  const timestamp = performance.now();
  if (!ref.current.timestamp) ref.current.timestamp = timestamp;
  const offset = timestamp - ref.current.timestamp;
  clearInterval(ref.current.timeout);
  ref.current.timeout = setTimeout(
    (ref, fn, ms) => {
      fn();
      ref.current.timestamp = performance.now();
      randomDeviationInterval(ref, fn, ms);
    },
    randomDeviation(ms - offset, 0.25),
    ref,
    fn,
    ms
  );
};

export const useCityInterval = ({ onSocialChange, onNationalChange }) => {
  const socialChangeTimeout = useRef({});
  const nationalChangeTimeout = useRef({});

  useEffect(() => {
    randomDeviationInterval(socialChangeTimeout, () => onSocialChange(), 1e3);
    randomDeviationInterval(
      nationalChangeTimeout,
      () => onNationalChange(),
      10e3
    );
  }, [onSocialChange, onNationalChange]);
};

const CitySocial = ({ city, upgrade }) => {
  const { [SOCIAL]: social } = city;
  return (
    <section>
      <h3 children="social" />
      <ul>
        <li children={["workers", toDisplayString(social.workers)].join(" ")} />
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
    </section>
  );
};

const CityNational = ({ city, upgrade }) => {
  const { [NATIONAL]: national } = city;
  const officialMax = computeOfficialMax({ city, upgrade });
  return (
    <section>
      <h3 children="national" />
      <ul>
        <li
          children={[
            "officials",
            toDisplayString(national.officials),
            `(${toDisplayString(officialMax)} max)`
          ].join(" ")}
        />
        <li children={["wealth", toDisplayString(national.wealth)].join(" ")} />
        <li
          children={["tax chance", toPercentage(national.taxchance)].join(" ")}
        />
        <li children={["tax rate", toPercentage(national.taxrate)].join(" ")} />
      </ul>
    </section>
  );
};

const City = props => {
  const { city } = props;
  return (
    <section>
      <h2 className="title" children={city.name} />

      <CitySocial {...props} />

      <CityNational {...props} />

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
