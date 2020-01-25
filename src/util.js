export const assert = (condition, errorMessage) => {
  if (!condition) throw new Error("Assertion:", errorMessage);
};
