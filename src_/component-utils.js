export const When = ({ when, or, children }) => {
  if (when) return children;
  else return or;
};
