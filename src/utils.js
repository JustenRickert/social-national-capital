export const sample = xs => xs[Math.floor(Math.random() * xs.length)];

export const randomDeviation = (n, maxOffset) =>
  n + 2 * (Math.random() - 0.5) * maxOffset * n;

export const tap = x => {
  console.log(x);
  return x;
};

export const range = n =>
  Array(n)
    .fill()
    .map((_, i) => i);

export const and = (...xs) => xs.every(Boolean);

export const randomCityName = () =>
  sample(["Metropolis", "Cityplace", "Townvillage"]);

const mapFn = (o, fn) => (Array.isArray(o) ? o.map(fn) : fn(o));
const first = xs => xs[0];
const rest = xs => xs.slice(1);

export const update = (o, keys, fn) => {
  if (typeof keys === "string") keys = keys.split(".");
  if (!keys.length) return mapFn(o, fn);
  return Object.assign({}, o, {
    [first(keys)]: mapFn(o[first(keys)], o => update(o, rest(keys), fn))
  });
};
