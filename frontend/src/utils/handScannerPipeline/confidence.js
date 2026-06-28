/**
 * Analyzes lighting using a video element and a canvas.
 * Draws a small center sample to check brightness.
 */
export const checkLighting = (videoEl, canvasEl) => {
  if (!videoEl || !canvasEl) return { score: 0, reason: 'No feed' };
  
  const ctx = canvasEl.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { score: 0, reason: 'No context' };

  try {
    // Sample a 50x50 area from the center
    const w = 50;
    const h = 50;
    const x = (canvasEl.width / 2) - (w / 2);
    const y = (canvasEl.height / 2) - (h / 2);
    
    ctx.drawImage(videoEl, x, y, w, h, x, y, w, h);
    const imgData = ctx.getImageData(x, y, w, h);
    const data = imgData.data;

    let rSum = 0, gSum = 0, bSum = 0;
    for (let i = 0; i < data.length; i += 4) {
      rSum += data[i];
      gSum += data[i+1];
      bSum += data[i+2];
    }
    
    const pixelCount = w * h;
    const avgBrightness = ((rSum + gSum + bSum) / 3) / pixelCount;
    
    // Brightness is 0-255
    if (avgBrightness < 40) return { score: 40, reason: 'Too Dark' };
    if (avgBrightness > 230) return { score: 40, reason: 'Too Bright / Glare' };
    
    let score = 100;
    if (avgBrightness < 80) score -= (80 - avgBrightness);
    if (avgBrightness > 200) score -= (avgBrightness - 200);
    
    return { score: Math.round(score), reason: 'Good' };
  } catch (e) {
    return { score: 100, reason: 'Skipped' };
  }
};

/**
 * Calculates overall measurement confidence.
 */
export const calculateConfidence = (visibilityScore, lightingScore, poseScore, stabilityScore) => {
  // Weighted sum
  // Visibility: 30%
  // Pose: 30%
  // Stability: 30%
  // Lighting: 10%
  
  const total = (visibilityScore * 0.3) + (poseScore * 0.3) + (stabilityScore * 0.3) + (lightingScore * 0.1);
  return Math.round(total);
};
