// MediaPipe Hand Landmark Indices
export const HAND_LANDMARKS = {
  WRIST: 0,
  INDEX_FINGER_MCP: 5,
  MIDDLE_FINGER_MCP: 9,
  RING_FINGER_MCP: 13,
  PINKY_MCP: 17,
  MIDDLE_FINGER_TIP: 12
};

/**
 * Calculates Euclidean distance between two 3D landmarks.
 * Landmarks are expected to have x, y, and optionally z properties.
 */
export const calculateDistance3D = (p1, p2) => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = (p1.z || 0) - (p2.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

/**
 * Calculates distance between two 2D landmarks (ignoring depth).
 */
export const calculateDistance2D = (p1, p2) => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Validates if the hand is fully visible and spread out.
 * 
 * @param {Array} landmarks - Array of 21 landmark objects from MediaPipe.
 * @returns {object} Quality metrics.
 */
export const analyzeHandQuality = (landmarks) => {
  if (!landmarks || landmarks.length !== 21) {
    return { isGood: false, reason: 'Hand not fully detected', score: 0 };
  }

  // Check if wrist is visible (just a basic boundary check, MediaPipe handles bounding boxes, 
  // but we want to ensure it's not cut off at the very edge of the frame)
  const wrist = landmarks[HAND_LANDMARKS.WRIST];
  if (wrist.x < 0.05 || wrist.x > 0.95 || wrist.y < 0.05 || wrist.y > 0.95) {
    return { isGood: false, reason: 'Keep wrist visible in frame', score: 40 };
  }

  // Check if fingers are spread (distance between index MCP and pinky MCP)
  const indexMcp = landmarks[HAND_LANDMARKS.INDEX_FINGER_MCP];
  const pinkyMcp = landmarks[HAND_LANDMARKS.PINKY_MCP];
  const palmWidthNorm = calculateDistance2D(indexMcp, pinkyMcp);

  if (palmWidthNorm < 0.1) {
    return { isGood: false, reason: 'Spread fingers naturally', score: 60 };
  }
  
  // Calculate a generic quality score based on centering and size
  // Ideal size: Hand takes up about 40-60% of the screen
  const middleTip = landmarks[HAND_LANDMARKS.MIDDLE_FINGER_TIP];
  const handLengthNorm = calculateDistance2D(wrist, middleTip);
  
  let sizeScore = 100;
  if (handLengthNorm < 0.3) {
    sizeScore -= (0.3 - handLengthNorm) * 200; // Too small
  } else if (handLengthNorm > 0.8) {
    sizeScore -= (handLengthNorm - 0.8) * 200; // Too big
  }

  let centerScore = 100;
  const centerX = (wrist.x + middleTip.x) / 2;
  const centerY = (wrist.y + middleTip.y) / 2;
  const distFromCenter = Math.sqrt(Math.pow(centerX - 0.5, 2) + Math.pow(centerY - 0.5, 2));
  centerScore -= distFromCenter * 100;

  let finalScore = Math.round((sizeScore + centerScore) / 2);
  finalScore = Math.max(0, Math.min(100, finalScore));

  return {
    isGood: finalScore > 85,
    reason: finalScore > 85 ? 'Perfect position' : (sizeScore < centerScore ? 'Move hand closer/further' : 'Center your hand'),
    score: finalScore
  };
};
