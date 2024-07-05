import { fabric } from "fabric";

import { useEffect } from "react";
import { EyeIcon, EyeOffIcon, XIcon } from "lucide-react";
import { observer } from "mobx-react";
import { SketchPicker, ColorResult } from "react-color";

import { Button } from "@/components/ui/button";
import { rightSidebarWidth } from "@/constants/layout";
import { useEditorContext } from "@/context/editor";
import { cn } from "@/lib/utils";
import { darkHexCodes, lightHexCodes, pastelHexCodes } from "@/constants/editor";

const picker = { default: { picker: { boxShadow: "none", padding: 0, width: "100%", background: "transparent", borderRadius: 0 } } };

function _StrokeSidebar() {
  const editor = useEditorContext();
  const selected = editor.canvas.selected;

  useEffect(() => {
    if (!selected) editor.setActiveSidebarRight(null);
  }, [selected, editor]);

  const onColorChange = (result: ColorResult) => {
    const { r, g, b, a } = result.rgb;
    const color = fabric.Color.fromRgba(`rgba(${r},${g},${b},${a || 1})`);
    const hex = color.toHexa();
    editor.canvas.onChangeActiveObjectProperty("stroke", `#${hex}`);
  };

  const disabled = !selected || !selected.stroke;
  const color = disabled ? "#ffffff" : selected.stroke;

  return (
    <div className="h-full" style={{ width: rightSidebarWidth }}>
      <div className="flex items-center h-14 border-b px-4 gap-2.5">
        <h2 className="font-semibold">Stroke</h2>
        <Button size="icon" variant="ghost" className="ml-auto h-7 w-7" onClick={() => editor.canvas.onChangeActiveObjectProperty("stroke", disabled ? "#000000" : "")}>
          {disabled ? <EyeOffIcon size={15} strokeWidth={2} /> : <EyeIcon size={15} strokeWidth={2} />}
        </Button>
        <Button size="icon" variant="outline" className="bg-card h-7 w-7" onClick={() => editor.setActiveSidebarRight(null)}>
          <XIcon size={15} />
        </Button>
      </div>
      <section className="sidebar-container">
        <div className={cn("px-4 py-4 flex flex-col divide-y", !disabled ? "opacity-100 pointer-events-auto" : "opacity-50 pointer-events-none")}>
          <div className="pb-4">
            <SketchPicker color={color} onChange={onColorChange} presetColors={[]} styles={picker} />
          </div>
          <div className="flex flex-col gap-4 py-5">
            <h4 className="text-xs font-semibold line-clamp-1">Light Colors</h4>
            <div className="grid grid-cols-8 gap-2.5">
              {lightHexCodes.map((code) => (
                <button
                  onClick={() => editor.canvas.onChangeActiveObjectProperty("stroke", code)}
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
                  onClick={() => editor.canvas.onChangeActiveObjectProperty("stroke", code)}
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
                  onClick={() => editor.canvas.onChangeActiveObjectProperty("stroke", code)}
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

export const StrokeSidebar = observer(_StrokeSidebar);
