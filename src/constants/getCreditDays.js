export const getCreditDays = (orderCount) => {
  if (orderCount >= 8) return 21;
  if (orderCount >= 5) return 14;
  if (orderCount >= 3) return 7;
  return 0;
};