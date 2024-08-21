export function modifyAnimationEasing(easing?: string, _?: number) {
  switch (easing) {
    case "spring":
      return `spring`;
    default:
      return easing || "linear";
  }
}

interface SpringConfig {
  mass?: number;
  stiffness?: number;
  damping?: number;
  velocity?: number;
}

interface SpringSimlutationPoint {
  time: number;
  position: number;
}

export function visualizeSpringAnimation({ damping = 10, mass = 1, stiffness = 100, velocity: speed = 0 }: SpringConfig, height = 250, width = 500) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const initialDisplacement = 1;
  const timeStep = 0.01;
  const totalTime = 2;
  const points: SpringSimlutationPoint[] = [];

  let velocity = speed;
  let position = initialDisplacement;

  for (let t = 0; t <= totalTime; t += timeStep) {
    const acceleration = (-stiffness * position - damping * velocity) / mass;
    velocity += acceleration * timeStep;
    position += velocity * timeStep;
    points.push({ time: t, position });
  }

  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();

  const scaleX = canvas.width / totalTime;
  const max = Math.max(...points.map((p) => Math.abs(p.position)));
  const scaleY = canvas.height / (2 * max);

  points.forEach((point) => {
    const x = point.time * scaleX;
    const y = canvas.height / 2 - point.position * scaleY;
    ctx.lineTo(x, y);
  });

  ctx.strokeStyle = "#2463EB";
  ctx.lineWidth = 5;
  ctx.stroke();

  return canvas.toDataURL("image/png", 1);
}
