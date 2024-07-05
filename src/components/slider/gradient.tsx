import Draggable, { DraggableEventHandler } from "react-draggable";
import { useMemo, useState } from "react";
import { nanoid } from "nanoid";

interface GradientSliderProps {
  width: number;
}

const handleWidth = 10;

export function GradientSlider({ width }: GradientSliderProps) {
  const [stops, setStops] = useState(() => [
    { id: nanoid(), color: "#020024", x: 0 },
    { id: nanoid(), color: "#090979", x: width / 2 - handleWidth },
    { id: nanoid(), color: "#00d4ff", x: width - handleWidth },
  ]);

  const css = useMemo(() => {
    const gradient = stops
      .map((stop, index) => {
        const offset = index === 0 ? 0 : handleWidth;
        const percentage = ((stop.x + offset) / width) * 100;
        return `${stop.color} ${percentage}%`;
      })
      .join(", ");
    return `linear-gradient(90deg, ${gradient})`;
  }, [stops]);

  const handleDrag =
    (id: string): DraggableEventHandler =>
    (_, data) => {
      setStops((state) => state.map((stop) => (stop.id === id ? { ...stop, x: data.x } : stop)));
    };

  return (
    <div className="h-8 border rounded-md relative" style={{ width, background: css }}>
      {stops.map((stop, index, array) => {
        const left = index === 0 ? 0 : array[index - 1].x + handleWidth;
        const right = index === array.length - 1 ? width - handleWidth : array[index + 1].x - handleWidth;
        return (
          <Draggable axis="x" key={stop.id} position={{ x: stop.x, y: 0 }} bounds={{ left, right }} onDrag={handleDrag(stop.id)}>
            <button className="h-8 -top-px cursor-grab active:cursor-grabbing absolute rounded-md bg-card border border-foreground/25 grid place-items-center" style={{ width: handleWidth }}>
              <div className="h-6 w-1 rounded-md" style={{ backgroundColor: stop.color }} />
            </button>
          </Draggable>
        );
      })}
    </div>
  );
}
