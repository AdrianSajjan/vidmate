import { XIcon } from "lucide-react";
import { observer } from "mobx-react";
import { useState } from "react";
import { flowResult } from "mobx";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { rightSidebarWidth } from "@/constants/layout";
import { useEditorContext } from "@/context/editor";
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

  const selected = editor.canvas.selected! as fabric.Image;
  const entry = backgroundRemover.cache.get(selected.name!);

  const handleLoadPlugin = () => {
    toast.promise(flowResult(backgroundRemover.onInitialize()), {
      loading: "Background removal plugin is being loaded...",
      success: "Background removal plugin is loaded",
      error: (error) => {
        console.log(error);
        return "Failed to load background removal plugin";
      },
    });
  };

  const disabled = backgroundRemover.initialized === "pending" || backgroundRemover.initialized === "initialized";

  return (
    <div className="flex flex-col">
      <Button size="sm" variant="outline" className="font-medium" disabled={disabled} onClick={handleLoadPlugin}>
        {backgroundRemover.initialized === "initialized" ? <span>Plugin Loaded</span> : <span>Load Plugin</span>}
      </Button>
      <div className="w-full h-auto rounded-md overflow-hidden relative mt-4">
        <img src={entry ? entry.original : selected.src} className="w-full h-auto" />
        {entry ? (
          <div className="bg-transparent-pattern bg-[length:120%] absolute top-0 left-0">
            <img src={entry.modified} className="h-full w-auto" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

const AIPlugin = observer(_AIPlugin);
const BGRemovalPlugin = observer(_BGRemovalPlugin);

const AIPluginItems = observer(_AIPluginItems);
const AIImagePluginItems = observer(_AIImagePluginItems);

export const AISidebar = observer(_AISidebar);
