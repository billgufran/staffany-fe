/**
 * 1000 * 60 * 60 * 24
 */
const DAY_IN_MS = 86_400_000;
/**
 * 1000 * 60 * 60 * 24 * 7
 */
const WEEK_IN_MS = DAY_IN_MS * 7;
/**
 * Since Unix epoch start on Thursday, subtract 3 days to get to Monday
 */
const UNIX_EPOCH_MONDAY_OFFSET = 259_200_000;

export const parseDate = (date: Date = new Date()) => {
  const UTCWeekNumber = Math.floor(
    (date.getTime() + UNIX_EPOCH_MONDAY_OFFSET) / WEEK_IN_MS
  );

  return {
    UTCWeekNumber,
  };
};

export const parseUTCWeekNumber = (weekNumber: number) => {
  const date = new Date(weekNumber * WEEK_IN_MS - UNIX_EPOCH_MONDAY_OFFSET);
  const sunday = new Date(date.getTime() + 6 * DAY_IN_MS);

  return {
    weekStartDate: date,
    weekEndDate: sunday,
  };
};
