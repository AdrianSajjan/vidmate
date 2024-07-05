import { fabric } from "fabric";

import { useEffect, useState } from "react";
import { EyeIcon, EyeOffIcon, XIcon } from "lucide-react";
import { observer } from "mobx-react";
import { SketchPicker, ColorResult } from "react-color";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useEditorContext } from "@/context/editor";
import { rightSidebarWidth } from "@/constants/layout";
import { cn } from "@/lib/utils";
import { darkHexCodes, lightHexCodes, pastelHexCodes } from "@/constants/editor";

const picker = { default: { picker: { boxShadow: "none", padding: 0, width: "100%", background: "transparent", borderRadius: 0 } } };

function _FillSidebar() {
  const editor = useEditorContext();
  const selected = editor.canvas.selected;

  const [tab, setTab] = useState("solid");

  useEffect(() => {
    if (!selected) editor.setActiveSidebarRight(null);
  }, [selected, editor]);

  const onColorChange = (result: ColorResult) => {
    const { r, g, b, a } = result.rgb;
    const color = fabric.Color.fromRgba(`rgba(${r},${g},${b},${a || 1})`);
    const hex = color.toHexa();
    editor.canvas.onChangeActiveObjectProperty("fill", `#${hex}`);
  };

  const disabled = !selected || !selected.fill || typeof selected.fill !== "string";
  const color = !selected || typeof selected.fill !== "string" ? "#ffffff" : selected.fill;

  return (
    <div className="h-full" style={{ width: rightSidebarWidth }}>
      <div className="flex items-center h-14 border-b px-4 gap-2.5">
        <h2 className="font-semibold">Fill</h2>
        <Button size="icon" variant="ghost" className="ml-auto h-7 w-7" onClick={() => editor.canvas.onChangeActiveObjectProperty("fill", !color ? "#000000" : "")}>
          {disabled ? <EyeOffIcon size={15} strokeWidth={2} /> : <EyeIcon size={15} strokeWidth={2} />}
        </Button>
        <Button size="icon" variant="outline" className="bg-card h-7 w-7" onClick={() => editor.setActiveSidebarRight(null)}>
          <XIcon size={15} />
        </Button>
      </div>
      <section className="sidebar-container">
        <div className="px-4 py-5">
          <Tabs value={tab} onValueChange={setTab}>
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
        <div className={cn("px-4 flex flex-col divide-y", !disabled ? "opacity-100 pointer-events-auto" : "opacity-50 pointer-events-none")}>
          {tab === "gradient" ? <div className="pb-4"></div> : null}
          <div className="pb-4">
            <SketchPicker color={color} onChange={onColorChange} presetColors={[]} styles={picker} />
          </div>
          <div className="flex flex-col gap-4 py-5">
            <h4 className="text-xs font-semibold line-clamp-1">Light Colors</h4>
            <div className="grid grid-cols-8 gap-2.5">
              {lightHexCodes.map((code) => (
                <button
                  onClick={() => editor.canvas.onChangeActiveObjectProperty("fill", code)}
                  key={code}
                  className="w-full aspect-square rounded border border-gray-400 transition-transform hover:scale-110"
                  style={{ backgroundColor: code }}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4 py-5">
            <h4 className="text-xs font-semibold line-clamp-1">Dark Colors</h4>
            <div className="grid grid-cols-8 gap-2.5">
              {darkHexCodes.map((code) => (
                <button
                  onClick={() => editor.canvas.onChangeActiveObjectProperty("fill", code)}
                  key={code}
                  className="w-full aspect-square rounded border border-gray-400 transition-transform hover:scale-110"
                  style={{ backgroundColor: code }}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4 py-5">
            <h4 className="text-xs font-semibold line-clamp-1">Pastel Colors</h4>
            <div className="grid grid-cols-8 gap-2.5">
              {pastelHexCodes.map((code) => (
                <button
                  onClick={() => editor.canvas.onChangeActiveObjectProperty("fill", code)}
                  key={code}
                  className="w-full aspect-square rounded border border-gray-400 transition-transform hover:scale-110"
                  style={{ backgroundColor: code }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export const FillSidebar = observer(_FillSidebar);
