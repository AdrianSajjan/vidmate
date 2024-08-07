import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const FilterSlider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>>(({ className, value, ...props }, ref) => (
  <SliderPrimitive.Root ref={ref} className={cn("relative flex w-full touch-none select-none items-center", className)} {...{ value, ...props }}>
    <SliderPrimitive.Track className="relative h-6 w-full grow overflow-hidden rounded-sm bg-primary/20">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-6 w-1 rounded-sm border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
    <span className="text-xxs font-medium text-primary-foreground absolute top-1/2 left-1.5 -translate-y-1/2 mt-px">{value?.at(0) || 0}</span>
  </SliderPrimitive.Root>
));

FilterSlider.displayName = SliderPrimitive.Root.displayName;

export { FilterSlider };
