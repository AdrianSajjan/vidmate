import { defaultSpringConfig } from "@/constants/animations";

export function modifyAnimationEasing(easing?: string, _?: number) {
  switch (easing) {
    case "spring":
      return `spring`;
    default:
      return easing || "linear";
  }
}

export function calculateSpringAnimationDuration({ damping, mass, stiffness } = defaultSpringConfig) {
  const epsilon = 0.01;
  const omega0 = Math.sqrt(stiffness / mass);

  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const timeToSettle = -Math.log(epsilon) / (zeta * omega0);

  const durationInMilliseconds = timeToSettle * 1000;
  return durationInMilliseconds;
}

export function visualizeSpringAnimation({ damping, mass, stiffness, velocity: speed } = defaultSpringConfig, height = 256, width = 640) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const initialDisplacement = 1;
  const timeStep = 0.01;
  const totalTime = 2;
  const points: Array<{ time: number; position: number }> = [];

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
