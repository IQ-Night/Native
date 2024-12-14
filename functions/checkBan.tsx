export const checkBanExpired = (ban: any) => {
  if (!ban || !ban.createdAt) {
    return true; // Assume expired if ban is null or missing createdAt
  }

  const currentTime = new Date();
  const expirationTime =
    new Date(ban.createdAt).getTime() + ban.totalHours * 60 * 60 * 1000;

  return expirationTime < currentTime.getTime();
};

// Function to convert selected duration to an appropriate format
export const convertDuration = (selectedDuration: any) => {
  const hours = selectedDuration; // Assuming selectedDuration is in hours

  // Convert to minutes if less than 1 hour
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }
  // Convert to days if more than 24 hours
  else if (hours >= 24 && hours < 168) {
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? "s" : ""}`;
  }
  // Convert to weeks if more than 168 hours (1 week) and less than 720 hours
  else if (hours >= 168 && hours < 720) {
    const weeks = Math.floor(hours / 168);
    return `${weeks} week${weeks !== 1 ? "s" : ""}`;
  }
  // Convert to months if more than 720 hours (30 days) and less than 8760 hours (1 year)
  else if (hours >= 720 && hours < 8760) {
    const months = Math.floor(hours / 720);
    return `${months} month${months !== 1 ? "s" : ""}`;
  }
  // Convert to years if more than 8760 hours (1 year)
  else if (hours >= 8760) {
    const years = Math.floor(hours / 8760);
    return `${years} year${years !== 1 ? "s" : ""}`;
  }
  // Default to hours
  return `${hours} hour${hours !== 1 ? "s" : ""}`;
};
