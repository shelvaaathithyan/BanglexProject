// Utility to check if festival is currently active (within start and end bounds)
export const isFestivalActive = (festival) => {
  if (!festival) return false;
  
  const now = new Date();
  
  if (festival.startDate) {
    const [year, month, day] = festival.startDate.split('-');
    const [hours, minutes] = (festival.startTime || '00:00').split(':');
    const startDateTime = new Date(year, month - 1, day, hours, minutes);
    if (now < startDateTime) return false;
  }
  
  if (festival.endDate) {
    const [year, month, day] = festival.endDate.split('-');
    const [hours, minutes] = (festival.endTime || '23:59').split(':');
    const endDateTime = new Date(year, month - 1, day, hours, minutes);
    if (now > endDateTime) return false;
  }
  
  return true;
};

// Utility to calculate festival discount price
export const getFestivalPrice = (originalPrice, festival) => {
  if (!festival || !originalPrice) return null;
  
  const discountValue = parseFloat(festival.discountValue);
  if (isNaN(discountValue) || discountValue <= 0) return null;

  // Check if festival is active (start and end times)
  if (!isFestivalActive(festival)) return null;

  const discountType = (festival.discountType || '').toLowerCase();
  if (discountType.includes('percentage') || discountType.includes('%')) {
    const discounted = originalPrice - (originalPrice * discountValue / 100);
    return Math.max(0, Math.round(discounted * 100) / 100);
  } else {
    // Fixed Amount (₹) or any other type - subtract directly
    const discounted = originalPrice - discountValue;
    return Math.max(0, Math.round(discounted * 100) / 100);
  }
};
