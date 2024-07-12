import useMeasure from "react-use-measure";
import Draggable from "react-draggable";

import { ChevronsLeftRightIcon, XIcon } from "lucide-react";
import { observer } from "mobx-react";
import { Fragment, useEffect, useState } from "react";
import { flowResult } from "mobx";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import { useEditorContext } from "@/context/editor";
import { rightSidebarWidth } from "@/constants/layout";
import { backgroundRemover } from "@/plugins/background-remover";

interface SelectPluginProps {
  plugin: string;
  onSelectPlugin: (plugin: string, label: string) => void;
}

function _AISidebar() {
  const editor = useEditorContext();

  const [label, setLabel] = useState("");
  const [plugin, setPlugin] = useState("");

  const handleSelectPlugin = (plugin: string, label: string) => {
    setLabel(label);
    setPlugin(plugin);
  };

  const handleClosePlugin = () => {
    setPlugin("");
    setLabel("");
  };

  if (!plugin) {
    return (
      <div className="h-full" style={{ width: rightSidebarWidth }}>
        <div className="flex items-center h-14 border-b px-4 gap-2.5">
          <h2 className="font-semibold">AI Magic</h2>
          <Button size="icon" variant="outline" className="bg-card h-7 w-7 ml-auto" onClick={() => editor.setActiveSidebarRight(null)}>
            <XIcon size={15} />
          </Button>
        </div>
        <section className="sidebar-container px-4 py-4">
          <AIPluginItems onSelectPlugin={handleSelectPlugin} />
        </section>
      </div>
    );
  }

  return (
    <div className="h-full" style={{ width: rightSidebarWidth }}>
      <div className="flex items-center h-14 border-b px-4 gap-2.5">
        <h2 className="font-semibold">{label}</h2>
        <Button size="icon" variant="outline" className="bg-card h-7 w-7 ml-auto" onClick={handleClosePlugin}>
          <XIcon size={15} />
        </Button>
      </div>
      <section className="sidebar-container px-4 py-4">
        <AIPlugin plugin={plugin} onSelectPlugin={handleSelectPlugin} />
      </section>
    </div>
  );
}

function _AIPluginItems(props: Omit<SelectPluginProps, "plugin">) {
  const editor = useEditorContext();
  const selected = editor.canvas.selected!;

  switch (selected.type) {
    case "image":
      return <AIImagePluginItems {...props} />;
    case "textbox":
      return null;
    default:
      return null;
  }
}

function _AIImagePluginItems({ onSelectPlugin }: Omit<SelectPluginProps, "plugin">) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col items-center gap-2">
        <button className="h-full w-full aspect-square rounded-md overflow-hidden border group" onClick={() => onSelectPlugin("bg-removal", "Background Removal")}>
          <img src="https://static.canva.com/web/images/555bf52f35233c8cc5de27c132755e4b.png" alt="" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
        </button>
        <span className="text-xs text-center w-11/12">BG Removal</span>
      </div>
    </div>
  );
}

function _AIPlugin({ plugin, onSelectPlugin }: SelectPluginProps) {
  switch (plugin) {
    case "bg-removal":
      return <BGRemovalPlugin onSelectPlugin={onSelectPlugin} />;
    default:
      return null;
  }
}

function _BGRemovalPlugin({}: Omit<SelectPluginProps, "plugin">) {
  const editor = useEditorContext();

  const [position, setPosition] = useState(0);
  const [ref, dimensions] = useMeasure();

  const selected = editor.canvas.selected! as fabric.Image;
  const entry = backgroundRemover.cache.get(selected.name!);
  const pending = backgroundRemover.pending.get(selected.name!);

  useEffect(() => {
    setPosition(dimensions.width / 2);
  }, [dimensions.width]);

  const handleRemoveBackground = async () => {
    try {
      const original = entry ? entry.original : selected.src;
      const blob = await flowResult(backgroundRemover.onRemoveBackground(original, selected.name!));
      const modified = URL.createObjectURL(blob);
      entry ? backgroundRemover.onCacheEntryUpdate(selected.name!, { modified }) : backgroundRemover.onCacheEntryAdd(selected.name!, original, modified, "original");
    } catch (error) {
      toast.error("Unable to remove background from image");
      console.warn(error);
    }
  };

  const handleAdd = () => {
    if (!entry) return;
    const { scaleX, scaleY, cropX, cropY, angle, height, width, top = 0, left = 0 } = selected;
    const promise = flowResult(editor.canvas.onAddImageFromSource(entry.modified, { top: top + 50, left: left + 50, scaleX, scaleY, cropX, cropY, angle, height, width }, true));
    toast.promise(promise, {
      loading: "Adding the modified image to your artboard...",
      success: () => "The modified image has been added to your artboard",
      error: () => "Failed to add the modified image to the artboard",
    });
  };

  const handleReplaceOriginal = () => {
    if (!entry) return;
    editor.canvas.onReplaceActiveImageSource(entry.modified);
    backgroundRemover.onCacheEntryUpdate(selected.name!, { usage: "modified" });
  };

  const handleRestoreOriginal = () => {
    if (!entry) return;
    editor.canvas.onReplaceActiveImageSource(entry.original);
    backgroundRemover.onCacheEntryUpdate(selected.name!, { usage: "original" });
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

const AIPlugin = observer(_AIPlugin);
const BGRemovalPlugin = observer(_BGRemovalPlugin);

const AIPluginItems = observer(_AIPluginItems);
const AIImagePluginItems = observer(_AIImagePluginItems);

export const AISidebar = observer(_AISidebar);
