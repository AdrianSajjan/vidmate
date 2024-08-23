import { XIcon } from "lucide-react";
import { observer } from "mobx-react";
import { useState } from "react";

import { BGRemovalPlugin } from "@/components/ai/bg-removal";
import { MagicWritePlugin } from "@/components/ai/magic-write";
import { Button } from "@/components/ui/button";
import { useEditorContext } from "@/context/editor";

interface AISelectPluginProps {
  plugin: string;
  onSelectPlugin: (plugin: string, label: string) => void;
}

interface AIPluginItem {
  label: string;
  value: string;
  title: string;
  thumbnail: string;
}

const pluginElementMap: Record<string, AIPluginItem[]> = {
  image: [
    {
      title: "Background Removal",
      value: "bg-removal",
      label: "BG Removal",
      thumbnail: "https://static.canva.com/web/images/555bf52f35233c8cc5de27c132755e4b.png",
    },
  ],
  textbox: [
    {
      title: "Magic Write",
      value: "magic-write",
      label: "Magic Write",
      thumbnail: "https://cdn.dribbble.com/userupload/11988346/file/original-051279240ec4c2b4b644c51121e6afa4.jpg?resize=400x0",
    },
  ],
};

function pluginState(selection?: fabric.Object | null) {
  if (selection?.type === "textbox" && selection.meta?.placeholder && selection.meta?.label) return { label: `Magic Write`, value: "magic-write" };
  return { label: "", value: "" };
}

function _AISidebar() {
  const editor = useEditorContext();
  const selected = editor.canvas.selection.active;

  const [label, setLabel] = useState(() => pluginState(selected).label);
  const [plugin, setPlugin] = useState(() => pluginState(selected).value);

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
      <div className="h-full w-full">
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
    <div className="h-full w-full">
      <div className="flex items-center h-14 border-b px-4 gap-2.5">
        <h2 className="font-semibold">{label}</h2>
        <Button size="icon" variant="outline" className="bg-card h-7 w-7 ml-auto" onClick={handleClosePlugin}>
          <XIcon size={15} />
        </Button>
      </div>
      <section className="sidebar-container px-4 py-4">
        <AIPluginItem plugin={plugin} onSelectPlugin={handleSelectPlugin} />
      </section>
    </div>
  );
}

function _AIPluginItems({ onSelectPlugin }: Omit<AISelectPluginProps, "plugin">) {
  const editor = useEditorContext();
  const selected = editor.canvas.selection.active!;
  const plugins = pluginElementMap[selected.type!];

  if (!plugins) return null;

  return (
    <div className="grid grid-cols-2 gap-4">
      {plugins.map((item) => (
        <div className="flex flex-col items-center gap-2">
          <button className="h-full w-full aspect-square rounded-md overflow-hidden border group" onClick={() => onSelectPlugin(item.value, item.title)}>
            <img src={item.thumbnail} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
          </button>
          <span className="text-xs text-center w-11/12">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function _AIPluginItem({ plugin, onSelectPlugin }: AISelectPluginProps) {
  switch (plugin) {
    case "bg-removal":
      return <BGRemovalPlugin onSelectPlugin={onSelectPlugin} />;
    case "magic-write":
      return <MagicWritePlugin onSelectPlugin={onSelectPlugin} />;
    default:
      return null;
  }
}

const AISidebar = observer(_AISidebar);
const AIPluginItem = observer(_AIPluginItem);
const AIPluginItems = observer(_AIPluginItems);

export { AISidebar, type AISelectPluginProps };
