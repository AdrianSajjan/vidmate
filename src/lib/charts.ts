type Scales = {
  x?: { grid?: { display?: boolean } };
  y?: { grid?: { display?: boolean } };
};

export function getChartGridlinesStatus(scales: Scales) {
  const xGrid = scales?.x?.grid?.display ?? false;
  const yGrid = scales?.y?.grid?.display ?? false;

  if (xGrid && yGrid) {
    return "both";
  } else if (xGrid) {
    return "y";
  } else if (yGrid) {
    return "x";
  } else {
    return "none";
  }
}

export function getBorderRadius(radius: number) {
  if (radius === 0) {
    return "Min";
  } else if (radius === 100) {
    return "Max";
  }
  return radius;
}
