/**
 * Performs statistical analysis on an array of measurements.
 */

export const analyzeMeasurements = (measurementBuffer) => {
  if (!measurementBuffer || measurementBuffer.length === 0) return null;

  // Calculate composite width for each frame
  // Formula: 60% Knuckle Width + 40% Palm Base Width
  const compositeWidths = measurementBuffer.map(m => (m.knuckleWidth * 0.6) + (m.palmWidth * 0.4));
  
  // Sort for outlier removal
  const sorted = [...compositeWidths].sort((a, b) => a - b);
  
  // Discard top 10% and bottom 10%
  const trimCount = Math.floor(sorted.length * 0.1);
  const trimmed = sorted.slice(trimCount, sorted.length - trimCount);
  
  if (trimmed.length === 0) return null;

  // Calculate Average
  const sum = trimmed.reduce((a, b) => a + b, 0);
  const average = sum / trimmed.length;

  // Calculate Median
  const mid = Math.floor(trimmed.length / 2);
  const median = trimmed.length % 2 !== 0 ? trimmed[mid] : (trimmed[mid - 1] + trimmed[mid]) / 2;

  // Average hand length for heuristic scaling
  const handLengths = measurementBuffer.map(m => m.handLength).sort((a, b) => a - b);
  const trimmedLengths = handLengths.slice(trimCount, handLengths.length - trimCount);
  const avgHandLength = trimmedLengths.reduce((a, b) => a + b, 0) / trimmedLengths.length;

  return {
    averageWidthNorm: average,
    medianWidthNorm: median,
    avgHandLengthNorm: avgHandLength,
    isValid: Math.abs(average - median) < (average * 0.05) // Max 5% variance between mean and median
  };
};
