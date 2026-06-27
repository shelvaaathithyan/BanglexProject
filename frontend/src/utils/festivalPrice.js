// Utility to check if festival is currently active (within start and end bounds)
export const isFestivalActive = (festival) => {
  if (!festival) return false;
  
  const now = new Date();
  
  if (festival.startDate) {
    const startDateTime = new Date(`${festival.startDate}T${festival.startTime || '00:00'}`);
    if (now < startDateTime) return false;
  }
  
  if (festival.endDate) {
    const endDateTime = new Date(`${festival.endDate}T${festival.endTime || '23:59'}`);
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
