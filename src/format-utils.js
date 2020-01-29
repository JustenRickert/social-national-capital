export const toCount = n => {
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

export const toMoney = n => toCount(n) + " ϵ";

export const toPercentage = n => (100 * n).toFixed(1) + "%";
