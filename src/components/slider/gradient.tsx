import Draggable, { DraggableData } from "react-draggable";
import { useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { cn } from "@/lib/utils";

interface GradientSliderProps {
  width: number;
  selected: number;
  onSelect: (index: number) => void;
  onChange: (index: number, offset: number) => void;
}

const handleWidth = 10;

export function GradientSlider({ width, selected, onChange, onSelect }: GradientSliderProps) {
  const [stops] = useState(() => [
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

  const handleDrag = (index: number) => (_: unknown, data: DraggableData) => {
    onChange(index, data.x);
  };

  return (
    <div className="h-8 border rounded-md relative" style={{ width, background: css }}>
      {stops.map((stop, index, array) => {
        const left = index === 0 ? 0 : array[index - 1].x + handleWidth;
        const right = index === array.length - 1 ? width - handleWidth : array[index + 1].x - handleWidth;
        return (
          <Draggable axis="x" key={stop.color + index} position={{ x: stop.x, y: 0 }} bounds={{ left, right }} onDrag={handleDrag(index)}>
            <button
              onClick={() => onSelect(index)}
              className={cn("h-8 -top-px cursor-grab active:cursor-grabbing absolute rounded-md bg-card border border-foreground/25 grid place-items-center", selected === index ? "ring-2 ring-blue-600" : "ring-0")}
              style={{ width: handleWidth }}
            >
              <div className="h-6 w-1 rounded-md" style={{ backgroundColor: stop.color }} />
            </button>
          </Draggable>
        );
      })}
    </div>
  );
}
