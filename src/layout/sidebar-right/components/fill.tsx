import { fabric } from "fabric";

import { useEffect, useMemo, useState } from "react";
import { EyeIcon, EyeOffIcon, XIcon } from "lucide-react";
import { observer } from "mobx-react";
import { SketchPicker, ColorResult } from "react-color";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useEditorContext } from "@/context/editor";
import { rightSidebarWidth } from "@/constants/layout";
import { cn } from "@/lib/utils";
import { darkHexCodes, lightHexCodes, pastelHexCodes } from "@/constants/editor";
import { GradientSlider } from "@/components/slider/gradient";
import { defaultFill, defaultGradient } from "@/fabric/constants";
import { toJS } from "mobx";

const picker = { default: { picker: { boxShadow: "none", padding: 0, width: "100%", background: "transparent", borderRadius: 0 } } };

function _FillSidebar() {
  const editor = useEditorContext();
  const selected = editor.canvas.selected;

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!selected) editor.setActiveSidebarRight(null);
  }, [selected, editor]);

  const mode = useMemo(() => {
    if (!selected || !selected.fill || typeof selected.fill === "string") return "solid";
    return "gradient";
  }, [selected]);

  const color = useMemo(() => {
    if (!selected || !selected.fill) return defaultFill;
    if (typeof selected.fill === "string") return selected.fill;
    return (selected.fill as fabric.Gradient).colorStops![index].color;
  }, [selected, index]);

  const colors = useMemo(() => {
    if (!selected || !selected.fill || typeof selected.fill === "string") return [];
    return (selected.fill as fabric.Gradient).colorStops!;
  }, [selected]);

  const onToggleFill = () => {
    if (!selected) return;
    if (selected.fill) {
      editor.canvas.onChangeActiveObjectProperty("previousFill", mode === "solid" ? selected.fill : selected.previousFill);
      editor.canvas.onChangeActiveObjectProperty("fill", "");
    } else {
      const fill = !selected.previousFill || typeof selected.previousFill !== "string" ? defaultFill : selected.previousFill;
      editor.canvas.onChangeActiveObjectProperty("fill", fill);
    }
  };

  const onChangeColor = (result: ColorResult) => {
    if (!selected) return;

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
        editor.canvas.onChangeActiveObjectFillGradient(fill.type!, stops!);
        break;
      }
    }
  };

  const onSelectColorFromSwatch = (color: string) => {
    if (!selected) return;

    switch (mode) {
      case "solid": {
        editor.canvas.onChangeActiveObjectProperty("fill", color);
        break;
      }
      case "gradient": {
        const fill = selected.fill as fabric.Gradient;
        const stops = toJS(fill.colorStops);
        stops![index].color = color;
        editor.canvas.onChangeActiveObjectFillGradient(fill.type!, stops!);
        break;
      }
    }
  };

  const onChangeOffset = (index: number, offset: number) => {
    if (!selected) return;
    const fill = selected.fill as fabric.Gradient;
    const stops = toJS(fill.colorStops!);
    stops[index].offset = offset;
    console.log(stops);
    editor.canvas.onChangeActiveObjectFillGradient(fill.type!, stops);
  };

  const onChangeMode = (value: string) => {
    if (value === mode || !selected) return;
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
        editor.canvas.onChangeActiveObjectFillGradient(fill.type, fill.colorStops);
        editor.canvas.onChangeActiveObjectProperty("previousFill", previousFill);
        break;
      }
    }
  };

  const disabled = !selected || !selected.fill;

  return (
    <div className="h-full" style={{ width: rightSidebarWidth }}>
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
                  <circle cx="8" cy="8" r="4" fill="currentColor" fill-opacity="0.9" />
                  <circle opacity="0.75" cx="8" cy="8" r="5.5" stroke="currentColor" stroke-opacity="0.9" />
                </svg>
                <span>Solid</span>
              </TabsTrigger>
              <TabsTrigger value="gradient" className="text-xs h-full gap-1">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="4" fill="url(#paint0_linear)" fill-opacity="0.9" />
                  <circle opacity="0.75" cx="8" cy="8" r="5.5" stroke="currentColor" stroke-opacity="0.9" />
                  <defs>
                    <linearGradient id="paint0_linear" x1="8" y1="4" x2="8" y2="12" gradientUnits="userSpaceOnUse">
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
          {mode === "gradient" ? (
            <div className="pb-4">
              <GradientSlider width={264} colors={colors} selected={index} onSelect={setIndex} onChange={onChangeOffset} />
            </div>
          ) : null}
          <div className="pb-4">
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
