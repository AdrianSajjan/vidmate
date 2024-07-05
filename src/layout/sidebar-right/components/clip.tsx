import { Fragment, useEffect, useMemo, useState } from "react";
import { XIcon } from "lucide-react";
import { observer } from "mobx-react";

import { Button } from "@/components/ui/button";
import { rightSidebarWidth } from "@/constants/layout";
import { useEditorContext } from "@/context/editor";
import { Skeleton } from "@/components/ui/skeleton";

function _ClipMaskSidebar() {
  const editor = useEditorContext();
  const selected = editor.canvas.selected;

  useEffect(() => {
    if (!selected || !(selected.type === "image" || selected.type === "video")) editor.setActiveSidebarRight(null);
  }, [selected, editor]);

  const scene = useMemo(() => {
    return editor.canvas.elements.filter((element) => element.name !== selected?.name && element.type !== "textbox");
  }, [editor.canvas.elements, editor.canvas.elements.length, selected]);

  return (
    <div className="h-full" style={{ width: rightSidebarWidth }}>
      <div className="flex items-center h-14 border-b px-4 gap-2.5">
        <h2 className="font-semibold">Clip Mask</h2>
        <Button size="icon" variant="outline" className="bg-card h-7 w-7 ml-auto" onClick={() => editor.setActiveSidebarRight(null)}>
          <XIcon size={15} />
        </Button>
      </div>
      <div className="px-3 pt-3 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <h4 className="text-xs font-semibold line-clamp-1">Scene Elements</h4>
            <Button size="sm" variant="link" className="text-blue-600 font-medium line-clamp-1">
              See All
            </Button>
          </div>
          <div className="flex gap-2.5 items-center overflow-scroll scrollbar-hidden relative">
            {scene.length ? (
              scene.map((element) => <SceneElement key={element.name} element={element} />)
            ) : (
              <Fragment>
                {Array.from({ length: 3 }, (_, index) => (
                  <Skeleton key={index} className="h-16 flex-1 rounded-md" />
                ))}
                <span className="text-xs font-semibold text-foreground/60 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 leading-none">No Elements</span>
              </Fragment>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function _SceneElement({ element }: { element: fabric.Object }) {
  const editor = useEditorContext();
  const [objectURL, setObjectURL] = useState("");

  useEffect(() => {
    const object = editor.canvas.instance?.getItemByName(element.name);
    object?.clone((clone: fabric.Object) => {
      clone.opacity = 1;
      clone.visible = true;
      clone.clipPath = undefined;
      setObjectURL(clone.toDataURL({ format: "jpeg", quality: 0.75, withoutShadow: true, withoutTransform: true }));
    });
  }, [element, editor.canvas.instance]);

  const handleAddClipPath = () => {
    const object = editor.canvas.instance?.getItemByName(element.name);
    if (!object) return;
    editor.canvas.onAddClipPathToActiveImage(object);
  };

  return (
    <button
      onClick={handleAddClipPath}
      className="group shrink-0 h-16 w-16 border flex items-center justify-center overflow-hidden rounded-md p-2 text-gray-800/80 dark:text-gray-100/80 transition-colors shadow-sm hover:bg-card hover:text-gray-800 dark:hover:text-gray-100"
    >
      <img src={objectURL} alt={element.name?.split("_").at(0)} />
    </button>
  );
}

const SceneElement = observer(_SceneElement);

export const ClipMaskSidebar = observer(_ClipMaskSidebar);
