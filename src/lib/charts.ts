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

export function colorToHex(color: string): string {
  // Function to convert RGB to Hex
  const rgbToHex = (r: number, g: number, b: number) => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  };

  // Check if the color is already in hexadecimal format
  if (/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
    return color;
  }

  // Create a temporary element to test color conversion
  const tempElement = document.createElement("div");
  tempElement.style.color = color;
  document.body.appendChild(tempElement);

  // Get the computed color
  const computedColor = window.getComputedStyle(tempElement).color;
  document.body.removeChild(tempElement);

  // Check if the computed color is in RGB format
  const rgbMatch = computedColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (rgbMatch) {
    return rgbToHex(parseInt(rgbMatch[1], 10), parseInt(rgbMatch[2], 10), parseInt(rgbMatch[3], 10));
  }

  // Check if the computed color is in RGBA format
  const rgbaMatch = computedColor.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+\.?\d*)\)$/);
  if (rgbaMatch) {
    return rgbToHex(parseInt(rgbaMatch[1], 10), parseInt(rgbaMatch[2], 10), parseInt(rgbaMatch[3], 10));
  }

  // If no match, return the input color (couldn't convert)
  return color;
}
