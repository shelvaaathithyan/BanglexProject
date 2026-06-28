/**
 * Applies Exponential Moving Average (EMA) smoothing to landmarks
 * to reduce jitter across frames.
 */

const ALPHA = 0.4; // Smoothing factor (0.0 = completely ignores new data, 1.0 = no smoothing)

export const smoothLandmarks = (currentLandmarks, previousLandmarks) => {
  if (!previousLandmarks || previousLandmarks.length === 0) {
    return currentLandmarks;
  }

  return currentLandmarks.map((point, index) => {
    const prevPoint = previousLandmarks[index];
    return {
      x: ALPHA * point.x + (1 - ALPHA) * prevPoint.x,
      y: ALPHA * point.y + (1 - ALPHA) * prevPoint.y,
      z: point.z !== undefined ? (ALPHA * point.z + (1 - ALPHA) * (prevPoint.z || 0)) : undefined
    };
  });
};
