import { ArrowRightIcon, CheckIcon, SearchIcon, XIcon } from "lucide-react";
import { observer } from "mobx-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { EditorFont, fonts } from "@/constants/fonts";
import { rightSidebarWidth } from "@/constants/layout";
import { useEditorContext } from "@/context/editor";

function _FontSidebar() {
  const editor = useEditorContext();
  const selected = editor.canvas.selected! as fabric.Textbox;

  const isFontSelected = (font: EditorFont) => {
    return selected.fontFamily?.toLowerCase() === font.family.toLowerCase();
  };

  return (
    <div className="h-full" style={{ width: rightSidebarWidth }}>
      <div className="flex items-center h-14 border-b px-4 gap-2.5">
        <h2 className="font-semibold">Fonts</h2>
        <Button size="icon" variant="outline" className="bg-card h-7 w-7 ml-auto" onClick={() => editor.setActiveSidebarRight(null)}>
          <XIcon size={15} />
        </Button>
      </div>
      <section className="sidebar-container">
        <div className="px-3 py-4">
          <div className="relative">
            <Input placeholder="Search..." className="text-xs pl-8" />
            <SearchIcon size={15} className="absolute top-1/2 -translate-y-1/2 left-2.5 text-foreground/60" />
          </div>
        </div>
        <div className="px-3 flex flex-col gap-1">
          {fonts.map((font) => (
            <FontItem key={font.family} font={font} selected={isFontSelected(font)} />
          ))}
        </div>
      </section>
    </div>
  );
}

interface FontItemProps {
  font: EditorFont;
  selected: boolean;
}

function _FontItem({ font, selected }: FontItemProps) {
  return (
    <button className="inline-flex items-center text-sm text-start hover:bg-gray-100 rounded-md transition-colors p-2.5 gap-4">
      <ArrowRightIcon size={15} />
      <span>{font.family}</span>
      {selected ? <CheckIcon size={15} className="ml-auto" /> : null}
    </button>
  );
}

const FontItem = observer(_FontItem);
export const FontSidebar = observer(_FontSidebar);
