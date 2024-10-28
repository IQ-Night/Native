export const FormatDate = (dateValue: any, type: any) => {
  const date = new Date(dateValue);

  // Extract parts of the date
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  // Extract parts of the time
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  // Construct formatted date and time string
  let formattedDate;
  if (type === "onlyDate") {
    formattedDate = `${day} ${month} ${year}`;
  } else {
    formattedDate = `${day} ${month} ${year} - ${hours}:${minutes}`;
  }

  return formattedDate;
};
