export const getCurrentTimeWindow = () => {
  const now = new Date();
  const start = new Date(now);
  start.setMinutes(0, 0, 0);
  
  const end = new Date(start);
  end.setHours(end.getHours() + 1);
  
  return `${formatDateTime(start)} - ${formatDateTime(end)}`;
};

export const getCurrentHourWindow = () => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(start.getHours() - 1, 0, 0, 0);
  
  const end = new Date(now);
  end.setMinutes(0, 0, 0);
  
  return `${formatDateTime(start)} - ${formatDateTime(end)}`;
};

export const getCurrentAggregationWindow = () => {
  const now = new Date();
  const start = new Date(now);
  start.setMinutes(Math.floor(start.getMinutes() / 2) * 2, 0, 0);
  
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 2);
  
  return `${formatDateTime(start)} - ${formatDateTime(end)}`;
};

const formatDateTime = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export const getDateRange = (period) => {
  const end = new Date();
  const start = new Date();
  
  switch (period) {
    case "day":
      start.setDate(start.getDate() - 1);
      break;
    case "week":
      start.setDate(start.getDate() - 7);
      break;
    case "month":
      start.setMonth(start.getMonth() - 1);
      break;
    default:
      start.setDate(start.getDate() - 7);
  }
  
  return { start, end };
};
