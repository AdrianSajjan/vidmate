import Draggable from "react-draggable";
import useMeasure from "react-use-measure";

import { ChevronsLeftRightIcon } from "lucide-react";
import { flowResult } from "mobx";
import { observer } from "mobx-react";
import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import { rmbgAI } from "@/models/rmbg";
import { useEditorContext } from "@/context/editor";
import { AISelectPluginProps } from "@/layout/sidebar-right/components/ai";

function _BGRemovalPlugin({}: Omit<AISelectPluginProps, "plugin">) {
  const editor = useEditorContext();

  const [position, setPosition] = useState(0);
  const [ref, dimensions] = useMeasure();

  const selected = editor.canvas.selection.active! as fabric.Image;
  const entry = rmbgAI.cache.get(selected.name!);
  const pending = rmbgAI.pending.get(selected.name!);

  useEffect(() => {
    setPosition(dimensions.width / 2);
  }, [dimensions.width]);

  const handleRemoveBackground = async () => {
    try {
      const original = entry ? entry.original : selected.src;
      const blob = await flowResult(rmbgAI.removeBackground(original, selected.name!));
      const modified = URL.createObjectURL(blob);
      entry ? rmbgAI.updateCacheEntry(selected.name!, { modified }) : rmbgAI.addCacheEntry(selected.name!, original, modified, "original");
    } catch (error) {
      toast.error("Unable to remove background from image");
      console.warn(error);
    }
  };

  const handleAdd = () => {
    if (!entry) return;
    const { scaleX, scaleY, cropX, cropY, angle, height, width, top = 0, left = 0 } = selected;
    const promise = flowResult(editor.canvas.onAddImageFromSource(entry.modified, { top: top + 50, left: left + 50, scaleX, scaleY, cropX, cropY, angle, height, width }, true));
    toast.promise(promise, { loading: "Adding the modified image to your artboard...", success: "The modified image has been added to your artboard", error: "Failed to add the modified image to the artboard" });
  };

  const handleReplaceOriginal = () => {
    if (!entry) return;
    editor.canvas.replacer.mark(editor.canvas.instance.getActiveObject());
    const promise = flowResult(editor.canvas.replacer.replace(entry.modified)).then(() => rmbgAI.updateCacheEntry(selected.name!, { usage: "modified" }));
    toast.promise(promise, { loading: "Loading the replacement image...", success: "The selected image has been replaced", error: "Failed to replace the selected image" });
  };

  const handleRestoreOriginal = () => {
    if (!entry) return;
    editor.canvas.replacer.mark(editor.canvas.instance.getActiveObject());
    const promise = flowResult(editor.canvas.replacer.replace(entry.original)).then(() => rmbgAI.updateCacheEntry(selected.name!, { usage: "original" }));
    toast.promise(promise, { loading: "Restoring the original image...", success: "The selected image has been restored", error: "Failed to restore the selected image" });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="w-full h-auto relative" ref={ref}>
        {entry ? (
          <Fragment>
            <div className="bg-transparent-pattern">
              <img src={entry.modified} className="w-full h-auto" />
            </div>
            <div className="bg-transparent-pattern absolute inset-0 overflow-hidden" style={{ width: position }}>
              <img src={entry.original} className="w-full h-full object-cover object-left-top" />
            </div>
            <Draggable axis="x" bounds={{ left: 0, right: dimensions.width }} position={{ x: position, y: 0 }} onDrag={(_, data) => setPosition(data.x)}>
              <div className="h-full w-0.5 bg-primary rounded-xl absolute top-0 grid place-items-center cursor-ew-resize">
                <div className="absolute h-6 w-6 rounded-full bg-primary grid place-items-center text-primary-foreground">
                  <ChevronsLeftRightIcon size={14} />
                </div>
              </div>
            </Draggable>
          </Fragment>
        ) : (
          <div className="bg-transparent-pattern">
            <img src={selected.src} className="w-full h-auto" />
          </div>
        )}
      </div>
      {!entry ? (
        <div className="flex">
          <Button size="sm" className="w-full gap-2.5" variant="outline" disabled={pending} onClick={handleRemoveBackground}>
            {pending ? <Spinner className="h-4 w-4" /> : null}
            <span>Remove Background</span>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Button size="sm" className="w-full" onClick={handleAdd}>
            Add as New Image
          </Button>
          {entry.usage === "original" ? (
            <Button size="sm" className="w-full" variant="outline" onClick={handleReplaceOriginal}>
              Replace Original Image
            </Button>
          ) : (
            <Button size="sm" className="w-full" variant="outline" onClick={handleRestoreOriginal}>
              Restore Original Image
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export const BGRemovalPlugin = observer(_BGRemovalPlugin);
