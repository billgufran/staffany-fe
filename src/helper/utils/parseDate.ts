export const parseDate = (date: Date = new Date()) => {
  const weekNumber = Math.floor(
    (date.getTime() + 259_200_000) / 604_800_000
  );

  return {
    weekNumber,
    year: date.getFullYear(),
    isoString: date.toISOString(),
  };
};
