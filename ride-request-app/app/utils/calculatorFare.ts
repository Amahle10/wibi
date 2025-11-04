export const calculateFare = (distanceKm: number): number => {
  const baseFare = 10;
  const perKm = 5;
  return Math.round(baseFare + distanceKm * perKm);
};
