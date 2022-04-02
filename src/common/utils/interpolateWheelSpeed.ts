type SpeedT = [number, number];

const intervals = {};

export const interpolateWheelSpeed = (
  key: string,
  left: SpeedT,
  right: SpeedT,
  steps: number,
  ms: number,
  onInterpolateStep: (left: number, right: number) => void
) => {
  if (key in intervals) {
    return;
  }
  const stepMs = Math.round(ms / steps);
  let step = 0;
  const stepLeft = (left[1] - left[0]) / steps;
  const stepRight = (right[1] - right[0]) / steps;

  step = step + 1;
  onInterpolateStep(
    Math.round(left[0] + stepLeft * step),
    Math.round(right[0] + stepRight * step)
  );

  intervals[key] = window.setInterval(() => {
    step = step + 1;
    onInterpolateStep(
      Math.round(left[0] + stepLeft * step),
      Math.round(right[0] + stepRight * step)
    );
    if (step >= steps) {
      clearInterpolate(key, false);
    }
  }, stepMs);
};

const clear = (k, deleteKey) => {
  window.clearInterval(intervals[k]);
  if (deleteKey) {
    delete intervals[k];
  }
};

export const clearInterpolate = (key, deleteKey = true) => {
  if (key === 'all') {
    Object.keys(intervals).map((k) => {
      clear(k, deleteKey);
    });
  } else if (key in intervals) {
    clear(key, deleteKey);
  }
};
