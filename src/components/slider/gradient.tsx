import Draggable, { DraggableData } from "react-draggable";
import { useMemo } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { cn } from "@/lib/utils";
import { FabricUtils } from "@/fabric/utils";

interface GradientSliderProps {
  width: number;
  selected: number;
  onSelect: (index: number) => void;
  colors: fabric.IGradientOptionsColorStops;
  coords: fabric.IGradientOptionsCoords;
  onChange: (index: number, offset: number) => void;
  onRotate: (angle: number) => void;
}

const handleWidth = 10;

export function GradientSlider({ width: container, selected, colors, coords, onChange, onSelect, onRotate }: GradientSliderProps) {
  const width = container - handleWidth;

  const stops = useMemo(() => {
    return colors.map(({ color, offset }) => ({
      color: color,
      x: width * offset,
    }));
  }, [colors, width]);

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
    onChange(index, data.x / width);
  };

  return (
    <div className="pb-4 flex flex-col gap-3">
      <div className="relative h-8">
        <div className="h-full border rounded-md relative" style={{ width: container, background: css }}></div>
        <div className="absolute h-full top-0 left-0" style={{ width }}>
          {stops.map((stop, index, array) => {
            const left = index === 0 ? 0 : array[index - 1].x + handleWidth;
            const right = index === array.length - 1 ? width : array[index + 1].x - handleWidth;
            return (
              <Draggable axis="x" key={stop.color + index} position={{ x: stop.x, y: 0 }} bounds={{ left, right }} onDrag={handleDrag(index)} onMouseDown={() => onSelect(index)}>
                <button
                  className={cn("h-8 cursor-grab active:cursor-grabbing absolute rounded-md bg-card border border-foreground/25 grid place-items-center", selected === index ? "ring-2 ring-primary" : "ring-0")}
                  style={{ width: handleWidth }}
                >
                  <div className="h-6 w-1 rounded-md" style={{ backgroundColor: stop.color }} />
                </button>
              </Draggable>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-6">
        <Label htmlFor="angle" className="text-xs shrink-0 text-foreground/50">
          Gradient Angle
        </Label>
        <div className="relative">
          <Input id="angle" className="h-8 text-xs pr-6" type="number" step={15} value={FabricUtils.revertGradient(coords)} onChange={(event) => onRotate(+event.target.value)} />
          <span className="absolute text-foreground/50 right-2.5 top-1 text-sm">°</span>
        </div>
      </div>
    </div>
  );
}
