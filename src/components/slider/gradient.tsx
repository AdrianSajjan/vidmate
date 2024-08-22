import Draggable, { DraggableData } from "react-draggable";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { cn } from "@/lib/utils";
import { FabricUtils } from "@/fabric/utils";
import { Button } from "../ui/button";
import { RotateCwIcon } from "lucide-react";

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
  const [angle, setAngle] = useState(() => FabricUtils.revertGradient(coords));

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

  const handleRotate = (angle: number) => {
    onRotate(angle);
    setAngle(angle);
  };

  return (
    <div className="flex flex-col gap-3">
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
      <div className="flex items-center">
        <Label htmlFor="angle" className="text-xs shrink-0 text-foreground/50">
          Gradient Angle
        </Label>
        <div className="relative flex-1 ml-6 mr-2">
          <Input id="angle" className="h-8 text-xs pr-6 w-full" type="number" value={angle} onChange={(event) => handleRotate(+event.target.value)} />
          <span className="absolute text-foreground/50 right-2.5 top-1 text-sm">°</span>
        </div>
        <Button size="icon" variant="outline" className="shrink-0" onClick={() => handleRotate(angle + 15)}>
          <RotateCwIcon size={14} />
        </Button>
      </div>
    </div>
  );
}
