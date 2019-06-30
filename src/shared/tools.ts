export const SQLdate = (date: Date) => {
  date = new Date(date);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};
