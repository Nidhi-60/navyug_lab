export const getArrayValue = (id, array, key) => {
  return array?.find((ele) => ele[key] === id);
};
