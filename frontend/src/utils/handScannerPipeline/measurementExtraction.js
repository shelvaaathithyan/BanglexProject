import { HAND_LANDMARKS, calculateDistance2D } from '../landmarkUtils';

/**
 * Extracts multiple physical geometry measurements from landmarks.
 * Returns normalized distances.
 */
export const extractMeasurements = (landmarks) => {
  const indexMcp = landmarks[HAND_LANDMARKS.INDEX_FINGER_MCP];
  const pinkyMcp = landmarks[HAND_LANDMARKS.PINKY_MCP];
  const wrist = landmarks[HAND_LANDMARKS.WRIST];
  const middleTip = landmarks[HAND_LANDMARKS.MIDDLE_FINGER_TIP];
  
  // 1. Knuckle Width (Primary measure for rigid bangles)
  const knuckleWidth = calculateDistance2D(indexMcp, pinkyMcp);
  
  // 2. Palm Base Width (approximate using thumb base to pinky base)
  const thumbBase = landmarks[1];
  const palmWidth = calculateDistance2D(thumbBase, pinkyMcp);
  
  // 3. Hand Length (used for scaling heuristic)
  const handLength = calculateDistance2D(wrist, middleTip);

  // 4. Thumb Angle / Tucking indicator
  const thumbTip = landmarks[4];
  const thumbFoldDistance = calculateDistance2D(thumbTip, pinkyMcp);

  return {
    knuckleWidth,
    palmWidth,
    handLength,
    thumbFoldDistance
  };
};
