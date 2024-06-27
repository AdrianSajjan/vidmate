import { SearchIcon, XIcon } from "lucide-react";
import { observer } from "mobx-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEditorContext } from "@/context/editor";

function _TextSidebar() {
  const editor = useEditorContext();

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between h-14 border-b px-4">
        <h2 className="font-semibold">Text</h2>
        <Button size="icon" variant="outline" className="bg-card h-7 w-7" onClick={() => editor.onChangeActiveSidebar(null)}>
          <XIcon size={16} />
        </Button>
      </div>
      <div className="px-3 pt-4 pb-6">
        <div className="relative">
          <Input placeholder="Search..." className="text-xs pl-8" />
          <SearchIcon size={15} className="absolute top-1/2 -translate-y-1/2 left-2.5 text-foreground/60" />
        </div>
      </div>
      <div className="px-3 flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h4 className="text-xs font-semibold line-clamp-1">Basic Texts</h4>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => editor.canvas.onAddText("Your title goes here")}
              className="h-16 border flex items-center justify-center overflow-hidden rounded-md px-3 text-2xl font-semibold text-center transition-colors shadow-sm hover:bg-card"
            >
              <span className="line-clamp-1">Add a Title</span>
            </button>
            <button className="h-16 border flex items-center justify-center overflow-hidden rounded-md px-3 text-lg font-medium text-center transition-colors shadow-sm hover:bg-card">
              <span className="line-clamp-1">Add a Heading</span>
            </button>
            <button className="h-16 border flex items-center justify-center overflow-hidden rounded-md px-3 text-sm font-normal text-center transition-colors shadow-sm hover:bg-card">
              <span className="line-clamp-1">Add a Paragraph</span>
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="text-xs font-semibold line-clamp-1">Styled Texts</h4>
          <div className="flex flex-col gap-3">
            <button className="h-16 border flex items-center justify-center overflow-hidden rounded-md px-3 font-medium text-center shadow-sm pointer-events-none opacity-50">
              <span className="line-clamp-1">Coming Soon</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const TextSidebar = observer(_TextSidebar);
