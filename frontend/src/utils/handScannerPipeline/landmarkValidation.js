import { HAND_LANDMARKS } from '../landmarkUtils';

/**
 * Validates that all necessary landmarks are visible.
 * @param {Array} landmarks - 21 landmark objects from MediaPipe
 * @returns {object} { isValid: boolean, missing: Array<string> }
 */
export const validateLandmarkVisibility = (landmarks) => {
  if (!landmarks || landmarks.length !== 21) {
    return { isValid: false, missing: ['all'] };
  }

  const requiredIndices = [
    HAND_LANDMARKS.WRIST,
    HAND_LANDMARKS.INDEX_FINGER_MCP,
    HAND_LANDMARKS.MIDDLE_FINGER_MCP,
    HAND_LANDMARKS.RING_FINGER_MCP,
    HAND_LANDMARKS.PINKY_MCP,
    4, // Thumb tip
    8, // Index tip
    20 // Pinky tip
  ];

  const missing = [];
  
  // MediaPipe landmarks usually have a visibility score if they are estimated vs detected
  // For basic JS implementation without raw confidence, we ensure x and y are within frame bounds (0.0 to 1.0)
  for (const idx of requiredIndices) {
    const lm = landmarks[idx];
    if (lm.x < 0.02 || lm.x > 0.98 || lm.y < 0.02 || lm.y > 0.98) {
      missing.push(`Landmark ${idx} out of bounds`);
    }
  }

  return {
    isValid: missing.length === 0,
    missing
  };
};
