export function modifyAnimationEasing(easing?: string, duration?: number) {
  switch (easing) {
    case "spring":
      return "spring";
    case "easeOutElastic":
      return "easeOutElastic";
    case "spring":
      const { damping, mass, stiffness } = calculateSpringParameters(duration);
      return `spring(${mass},${stiffness},${damping},0)`;
    default:
      return easing || "linear";
  }
}

export function calculateSpringParameters(totalDuration = 250, numOscillations = 2, dampingRatio = 0.1) {
  const T = totalDuration / numOscillations;
  const omega = (2 * Math.PI) / T;
  const mass = 1;
  const stiffness = omega ** 2 * mass;
  const damping = 2 * dampingRatio * Math.sqrt(stiffness * mass);
  return { mass, stiffness, damping } as const;
}
