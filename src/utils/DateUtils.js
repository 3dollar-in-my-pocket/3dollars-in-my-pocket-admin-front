export const DateUtils = {
  toDateTime: (date) => {
    date.setHours(date.getHours() + 9);
    return date.toISOString().substring(0, 19);
  },
};
