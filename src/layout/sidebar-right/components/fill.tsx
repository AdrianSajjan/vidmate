import { fabric } from "fabric";
import { toJS } from "mobx";
import { EyeIcon, EyeOffIcon, PipetteIcon, XIcon } from "lucide-react";
import { observer } from "mobx-react";
import { useMemo, useState } from "react";
import { ColorResult, SketchPicker } from "react-color";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GradientSlider } from "@/components/slider/gradient";

import { darkHexCodes, lightHexCodes, pastelHexCodes } from "@/constants/editor";

import { useEditorContext } from "@/context/editor";
import { defaultFill, defaultGradient } from "@/fabric/constants";
import { cn, createInstance } from "@/lib/utils";
import useMeasure from "react-use-measure";
import { FabricUtils } from "@/fabric/utils";

const picker = {
  default: {
    picker: {
      boxShadow: "none",
      padding: 0,
      width: "100%",
      background: "transparent",
      borderRadius: 0,
    },
  },
};

function _FillSidebar() {
  const editor = useEditorContext();
  const selected = editor.canvas.selection.active!;

  const [index, setIndex] = useState(0);
  const [ref, measure] = useMeasure();

  const mode = useMemo(() => {
    if (!selected.fill || typeof selected.fill === "string") return "solid";
    return "gradient";
  }, [selected]);

  const color = useMemo(() => {
    if (!selected.fill) return defaultFill;
    if (typeof selected.fill === "string") return selected.fill;
    return (selected.fill as fabric.Gradient).colorStops![index].color;
  }, [selected, index]);

  const colors = useMemo(() => {
    if (!selected || !selected.fill || typeof selected.fill === "string") return [];
    return (selected.fill as fabric.Gradient).colorStops!;
  }, [selected]);

  const coords = useMemo(() => {
    if (!selected || !selected.fill || typeof selected.fill === "string") return { x1: 0, y1: 0, x2: 0, y2: 0 };
    return (selected.fill as fabric.Gradient).coords!;
  }, [selected]);

  const onToggleFill = () => {
    if (selected.fill) {
      editor.canvas.onChangeActiveObjectProperty("previousFill", mode === "solid" ? selected.fill : selected.previousFill);
      editor.canvas.onChangeActiveObjectProperty("fill", "");
    } else {
      const fill = !selected.previousFill || typeof selected.previousFill !== "string" ? defaultFill : selected.previousFill;
      editor.canvas.onChangeActiveObjectProperty("fill", fill);
    }
  };

  const onChangeColor = (result: ColorResult) => {
    const { r, g, b, a = 1 } = result.rgb;
    const color = fabric.Color.fromRgba(`rgba(${r},${g},${b},${a})`);
    const hex = color.toHexa();

    switch (mode) {
      case "solid": {
        editor.canvas.onChangeActiveObjectProperty("fill", `#${hex}`);
        break;
      }
      case "gradient": {
        const fill = selected.fill as fabric.Gradient;
        const stops = toJS(fill.colorStops);
        stops![index].color = `#${hex}`;
        editor.canvas.onChangeActiveObjectFillGradient(fill.type!, stops!, fill.coords!);
        break;
      }
    }
  };

  const onSelectColorFromSwatch = (color: string) => {
    switch (mode) {
      case "solid": {
        editor.canvas.onChangeActiveObjectProperty("fill", color);
        break;
      }
      case "gradient": {
        const fill = selected.fill as fabric.Gradient;
        const stops = toJS(fill.colorStops);
        stops![index].color = color;
        editor.canvas.onChangeActiveObjectFillGradient(fill.type!, stops!, fill.coords!);
        break;
      }
    }
  };

  const onChangeOffset = (index: number, offset: number) => {
    const fill = selected.fill as fabric.Gradient;
    const stops = toJS(fill.colorStops!);
    stops[index].offset = offset;
    editor.canvas.onChangeActiveObjectFillGradient(fill.type!, stops, fill.coords!);
  };

  const onRotateGradient = (angle: number) => {
    const fill = selected.fill as fabric.Gradient;
    editor.canvas.onChangeActiveObjectFillGradient(fill.type!, fill.colorStops!, FabricUtils.convertGradient(angle));
  };

  const onChangeMode = (value: string) => {
    if (value === mode) return;
    switch (value) {
      case "solid": {
        const fill = !selected.previousFill || typeof selected.previousFill !== "string" ? defaultFill : selected.previousFill;
        const previousFill = selected.fill;
        editor.canvas.onChangeActiveObjectProperty("fill", fill);
        editor.canvas.onChangeActiveObjectProperty("previousFill", previousFill);
        break;
      }
      case "gradient": {
        const fill = !selected.previousFill || typeof selected.previousFill === "string" ? defaultGradient : selected.previousFill;
        const previousFill = selected.fill;
        editor.canvas.onChangeActiveObjectFillGradient(fill.type, fill.colorStops, fill.coords);
        editor.canvas.onChangeActiveObjectProperty("previousFill", previousFill);
        break;
      }
    }
  };

  const onOpenEyeDropper = async () => {
    if (!window.EyeDropper) return;
    const eyeDropper = createInstance(window.EyeDropper);
    try {
      const result = await eyeDropper.open();
      onSelectColorFromSwatch(result.sRGBHex);
    } catch {
      toast.error("Failed to pick color from page");
    }
  };

  const disabled = !selected || !selected.fill;

  return (
    <div className="h-full w-full">
      <div className="flex items-center h-14 border-b px-4 gap-2.5">
        <h2 className="font-semibold">Fill</h2>
        <Button size="icon" variant="ghost" className="ml-auto h-7 w-7" onClick={onToggleFill}>
          {disabled ? <EyeOffIcon size={15} strokeWidth={2} /> : <EyeIcon size={15} strokeWidth={2} />}
        </Button>
        <Button size="icon" variant="outline" className="bg-card h-7 w-7" onClick={() => editor.setActiveSidebarRight(null)}>
          <XIcon size={15} />
        </Button>
      </div>
      <section className={cn("sidebar-container", !disabled ? "opacity-100 pointer-events-auto" : "opacity-50 pointer-events-none")}>
        <div className="px-4 py-5">
          <Tabs value={mode} onValueChange={onChangeMode}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="solid" className="text-xs h-full gap-1">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="4" fill="currentColor" fillOpacity="0.9" />
                  <circle opacity="0.75" cx="8" cy="8" r="5.5" stroke="currentColor" strokeOpacity="0.9" />
                </svg>
                <span>Solid</span>
              </TabsTrigger>
              <TabsTrigger value="gradient" className="text-xs h-full gap-1">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="4" fill="url(#fill-gradient)" fillOpacity="0.9" />
                  <circle opacity="0.75" cx="8" cy="8" r="5.5" stroke="currentColor" strokeOpacity="0.9" />
                  <defs>
                    <linearGradient id="fill-gradient" x1="8" y1="4" x2="8" y2="12" gradientUnits="userSpaceOnUse">
                      <stop stop-color="currentColor" />
                      <stop offset="1" stop-color="currentColor" stop-opacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
                <span>Gradient</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="px-4 flex flex-col divide-y">
          <div className="pb-4 flex flex-col gap-4">
            {mode === "gradient" ? (
              <div ref={ref}>
                <GradientSlider key={selected.name} width={measure.width} colors={colors} coords={coords} selected={index} onSelect={setIndex} onChange={onChangeOffset} onRotate={onRotateGradient} />
              </div>
            ) : null}
            {window.EyeDropper ? (
              <Button size="sm" variant="outline" className="gap-2 justify-between w-full shadow-none text-foreground/80" onClick={onOpenEyeDropper}>
                <span>Pick color from page</span>
                <PipetteIcon className="h-3.5 w-3.5" />
              </Button>
            ) : null}
            <SketchPicker color={color} onChange={onChangeColor} presetColors={[]} styles={picker} />
          </div>
          <div className="flex flex-col gap-4 py-5">
            <h4 className="text-xs font-semibold line-clamp-1">Light Colors</h4>
            <div className="grid grid-cols-8 gap-2.5">
              {lightHexCodes.map((code) => (
                <button onClick={() => onSelectColorFromSwatch(code)} key={code} className="w-full aspect-square rounded border border-gray-400 transition-transform hover:scale-110" style={{ backgroundColor: code }} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4 py-5">
            <h4 className="text-xs font-semibold line-clamp-1">Dark Colors</h4>
            <div className="grid grid-cols-8 gap-2.5">
              {darkHexCodes.map((code) => (
                <button onClick={() => onSelectColorFromSwatch(code)} key={code} className="w-full aspect-square rounded border border-gray-400 transition-transform hover:scale-110" style={{ backgroundColor: code }} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4 py-5">
            <h4 className="text-xs font-semibold line-clamp-1">Pastel Colors</h4>
            <div className="grid grid-cols-8 gap-2.5">
              {pastelHexCodes.map((code) => (
                <button onClick={() => onSelectColorFromSwatch(code)} key={code} className="w-full aspect-square rounded border border-gray-400 transition-transform hover:scale-110" style={{ backgroundColor: code }} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export const FillSidebar = observer(_FillSidebar);

declare global {
  interface ColorSelectionOptions {
    signal?: AbortSignal;
  }

  interface ColorSelectionResult {
    sRGBHex: string;
  }

  interface EyeDropper {
    open: (options?: ColorSelectionOptions) => Promise<ColorSelectionResult>;
  }

  interface EyeDropperConstructor {
    new (): EyeDropper;
  }

  interface Window {
    EyeDropper?: EyeDropperConstructor | undefined;
  }
}
