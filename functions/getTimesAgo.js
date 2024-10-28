export default function GetTimesAgo(date, justNow) {
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
    return "Just now";
  } else if (timeDiff < hour) {
    const minutesAgo = Math.floor(timeDiff / minute);
    return `${minutesAgo}min.`;
  } else if (timeDiff < day) {
    const hoursAgo = Math.floor(timeDiff / hour);
    return `${hoursAgo}h.`;
  } else if (timeDiff < week) {
    const daysAgo = Math.floor(timeDiff / day);
    return `${daysAgo}d.`;
  } else if (timeDiff < month) {
    const weeksAgo = Math.floor(timeDiff / week);
    return `${weeksAgo}w.`;
  } else if (timeDiff < year) {
    const monthsAgo = Math.floor(timeDiff / month);
    return `${monthsAgo}mo.`;
  } else {
    const yearsAgo = Math.floor(timeDiff / year);
    return `${yearsAgo}y.`;
  }
}
