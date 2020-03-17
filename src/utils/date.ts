// It is required because the time information from API is not valid date format
// ex) "2020/03/14 15:33:00"
export function getUTCFormatDate(date: string) {
  if (date && date.includes("/")) {
    return date
      .replace(" ", "T")
      .replace(/\//g, "-")
      .concat("+09:00");
  }
  return date;
}
