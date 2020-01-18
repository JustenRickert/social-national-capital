export const sample = xs => xs[Math.floor(Math.random() * xs.length)];

export const randomDeviation = (n, maxOffset) =>
  n + 2 * (Math.random() - 0.5) * maxOffset * n;

export const tap = x => {
  console.log(x);
  return x;
};

export const addition = ns => ns.reduce((sum, n) => sum + n, 0);

export const multiply = xs => xs.reduce((product, x) => product * (x + 1), 1);

export const range = n =>
  Array(n)
    .fill()
    .map((_, i) => i);

export const and = (...xs) => xs.every(Boolean);

export const randomCityName = () => {
  const pre = sample(["metro", "city", "town"]);
  const post = sample(["opolis", "place", "village"]);
  return [pre, post].join("");
};

const mapFn = (o, fn) => (Array.isArray(o) ? o.map(fn) : fn(o));
const first = xs => xs[0];
const rest = xs => xs.slice(1);

export const update = (o, keys, fn) => {
  if (!fn) return updates(o, keys);
  if (typeof keys === "string") keys = keys.split(".");
  if (!keys.length) return mapFn(o, fn);
  return Object.assign({}, o, {
    [first(keys)]: mapFn(o[first(keys)], o => update(o, rest(keys), fn))
  });
};

const updates = (o, [...keysFns]) =>
  keysFns.reduce((acc, [keys, fn]) => update(acc, keys, fn), o);

export const toDisplayString = n => {
  if (typeof n === "object")
    return Object.entries(n)
      .map(([key, n], _, ns) =>
        [
          n.toLocaleString("en", {
            notation: "compact",
            compactDisplay: ns.length > 1 ? "short" : "long"
          }),
          key
        ].join(" ")
      )
      .join("/");

  return n.toLocaleString("en", {
    notation: "compact",
    compactDisplay: "long"
  });
};
