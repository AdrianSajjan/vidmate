import { SearchIcon, XIcon } from "lucide-react";
import { observer } from "mobx-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useEditorContext } from "@/context/editor";
import { leftSidebarWidth } from "@/constants/layout";
import { formats } from "@/constants/editor";

function _FormatSidebar() {
  const editor = useEditorContext();

  return (
    <div className="h-full" style={{ width: leftSidebarWidth }}>
      <div className="flex items-center justify-between h-14 border-b px-4">
        <h2 className="font-semibold">Formats</h2>
        <Button size="icon" variant="outline" className="bg-card h-7 w-7" onClick={() => editor.setActiveSidebarLeft(null)}>
          <XIcon size={16} />
        </Button>
      </div>
      <section className="sidebar-container">
        <div className="px-3 pt-4 pb-6">
          <div className="relative">
            <Input placeholder="Search..." className="text-xs pl-8" />
            <SearchIcon size={15} className="absolute top-1/2 -translate-y-1/2 left-2.5 text-foreground/60" />
          </div>
        </div>
        <div className="px-4 grid grid-cols-3 gap-4 relative">
          {formats.map((format) => (
            <div className="flex flex-col gap-2">
              <button
                key={format.name}
                onClick={() => editor.canvas.onUpdateDimensions(format.dimensions)}
                className="group shrink-0 border flex items-center justify-center overflow-hidden rounded-md shadow-sm transition-colors hover:bg-card p-1.5"
              >
                <img src={format.preview} className="object-contain h-full w-full" />
              </button>
              <span className="text-xxs text-foreground/60 text-center">{format.name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export const FormatSidebar = observer(_FormatSidebar);
