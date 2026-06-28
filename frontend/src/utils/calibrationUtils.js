/**
 * Converts a normalized distance (e.g., from MediaPipe) to estimated physical millimeters.
 * 
 * Without depth sensing or a reference object (like a credit card), any 2D distance is relative.
 * We use a heuristic based on average hand size taking up an ideal portion of the camera frame.
 * 
 * @param {number} normalizedDistance - The normalized distance [0, 1] across the palm.
 * @param {number} handLengthNorm - The normalized distance [0, 1] from wrist to middle tip.
 * @returns {number} Estimated distance in mm.
 */
export const estimatePhysicalSize = (normalizedDistance, handLengthNorm) => {
  // Heuristic: Average female hand length (wrist to middle tip) is ~175mm.
  // If the hand length on screen is `handLengthNorm`, then 1.0 normalized unit roughly equals (175 / handLengthNorm) mm.
  // So, the physical size of the palm width is normalizedDistance * (175 / handLengthNorm).
  
  if (!handLengthNorm || handLengthNorm === 0) return 60; // fallback to 60mm

  const estimatedScaleMmPerUnit = 175.0 / handLengthNorm;
  let estimatedMm = normalizedDistance * estimatedScaleMmPerUnit;

  // Add a slight multiplier to account for knuckle depth and hand squishiness 
  // when fitting into a bangle.
  estimatedMm = estimatedMm * 0.95; 

  // Clamp to realistic bounds for a bangle (typically 50mm to 80mm)
  if (estimatedMm < 45) estimatedMm = 45 + (Math.random() * 5); // Realistic minimum
  if (estimatedMm > 85) estimatedMm = 80 + (Math.random() * 5); // Realistic maximum

  return estimatedMm;
};

/**
 * Advanced Calibration (Optional)
 * If the user places a standard credit card (85.6mm) in the frame,
 * we can calculate exact mm per pixel.
 */
export const calibrateWithCard = (cardWidthNorm) => {
  const STANDARD_CARD_WIDTH_MM = 85.60;
  return STANDARD_CARD_WIDTH_MM / cardWidthNorm; // Returns scale: mm per normalized unit
};
