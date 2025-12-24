
export const getMonthInfo = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const now = new Date();
  
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month;
  const isPastMonth = (now.getFullYear() > year) || (now.getFullYear() === year && now.getMonth() > month);
  
  // Get total days in the month being viewed
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  
  let daysToCalculateAvg = 0;
  if (isCurrentMonth) {
    daysToCalculateAvg = now.getDate();
  } else if (isPastMonth) {
    daysToCalculateAvg = totalDaysInMonth;
  } else {
    // For future months, we haven't spent any days yet
    daysToCalculateAvg = 0;
  }

  const monthName = date.toLocaleString('default', { month: 'long' });

  return {
    year,
    month,
    daysToCalculateAvg,
    totalDaysInMonth: totalDaysInMonth || 1, // Fallback to avoid division by zero
    monthName,
    isCurrentMonth,
    isPastMonth
  };
};

export const formatCurrency = (amount: number, currency: string = 'USD') => {
  if (isNaN(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};
