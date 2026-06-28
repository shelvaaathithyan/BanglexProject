import { HAND_LANDMARKS, calculateDistance2D } from '../landmarkUtils';

/**
 * Validates if the hand is in the correct folded position for bangle measurement.
 * @param {Array} landmarks 
 * @returns {object} { isCorrectPose: boolean, reason: string, score: number }
 */
export const validateFoldedPose = (landmarks) => {
  if (!landmarks || landmarks.length !== 21) return { isCorrectPose: false, reason: 'Invalid landmarks', score: 0 };

  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  const pinkyMcp = landmarks[HAND_LANDMARKS.PINKY_MCP];
  const indexMcp = landmarks[HAND_LANDMARKS.INDEX_FINGER_MCP];

  // 1. Thumb should be folded across the palm (closer to pinky base than index base)
  const distThumbToPinky = calculateDistance2D(thumbTip, pinkyMcp);
  const distThumbToIndex = calculateDistance2D(thumbTip, indexMcp);
  
  const isThumbFolded = distThumbToPinky < distThumbToIndex;

  // 2. Fingers should be relatively close together (not spread wide)
  const indexTip = landmarks[8];
  const pinkyTip = landmarks[20];
  const spreadDist = calculateDistance2D(indexTip, pinkyTip);
  const knuckleDist = calculateDistance2D(indexMcp, pinkyMcp);
  
  // If tips are spread much wider than knuckles, it's an open palm
  const areFingersTogether = spreadDist < (knuckleDist * 1.5);

  if (!isThumbFolded) {
    return { isCorrectPose: false, reason: 'Fold thumb across palm', score: 40 };
  }

  if (!areFingersTogether) {
    return { isCorrectPose: false, reason: 'Keep fingers together', score: 60 };
  }

  return { isCorrectPose: true, reason: 'Good pose', score: 98 };
};
