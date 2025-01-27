import { useAppContext } from "../context/app";

export default function GetTimesAgo(date, justNow) {
  const { activeLanguage } = useAppContext();
  if (typeof date === "string") {
    date = new Date(date);
  }

  // Calculate time difference in seconds
  const timeDiff = Math.floor((new Date() - date) / 1000);

  // Define time units in seconds
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;

  // Return appropriate time unit based on time difference
  if (timeDiff < minute) {
    return activeLanguage?.justNow;
  } else if (timeDiff < hour) {
    const minutesAgo = Math.floor(timeDiff / minute);
    return `${minutesAgo}${activeLanguage?.min}`;
  } else if (timeDiff < day) {
    const hoursAgo = Math.floor(timeDiff / hour);
    return `${hoursAgo}${activeLanguage?.h}`;
  } else if (timeDiff < week) {
    const daysAgo = Math.floor(timeDiff / day);
    return `${daysAgo}${activeLanguage?.d}`;
  } else if (timeDiff < month) {
    const weeksAgo = Math.floor(timeDiff / week);
    return `${weeksAgo}${activeLanguage?.w}`;
  } else if (timeDiff < year) {
    const monthsAgo = Math.floor(timeDiff / month);
    return `${monthsAgo}${activeLanguage?.m}`;
  } else {
    const yearsAgo = Math.floor(timeDiff / year);
    return `${yearsAgo}${activeLanguage?.y}`;
  }
}
