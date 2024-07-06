import { BoldIcon, ChevronDownIcon, ItalicIcon, LigatureIcon, UnderlineIcon } from "lucide-react";
import { observer } from "mobx-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";

import { fontSizes } from "@/constants/editor";
import { useEditorContext } from "@/context/editor";

import { ToolbarFillOption } from "../common/fill";
import { ToolbarPositionOption } from "../common/position";
import { ToolbarStrokeOption } from "../common/stroke";
import { ToolbarTimelineOption } from "../common/timeline";
import { cn } from "@/lib/utils";

function _TextToolbar() {
  const editor = useEditorContext();
  const selected = editor.canvas.selected as fabric.Textbox;

  return (
    <div className="flex items-center h-full w-full overflow-x-scroll scrollbar-hidden">
      <div className="flex items-center gap-4">
        <Button
          size="sm"
          variant="outline"
          className={cn("gap-1.5", editor.sidebarRight === "fonts" ? "bg-card" : "bg-transparent")}
          onClick={() => editor.setActiveSidebarRight(editor.sidebarRight === "fonts" ? null : "fonts")}
        >
          <LigatureIcon size={15} />
          <span>Montserrat</span>
          <ChevronDownIcon size={15} />
        </Button>
        <div className="relative">
          <Input className="h-8 w-24 text-xs pr-14" value={selected.fontSize} onChange={(event) => !isNaN(+event.target.value) && editor.canvas.onChangeActiveTextboxProperty("fontSize", +event.target.value)} />
          <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xs">px</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" className="h-5 w-5 absolute right-1.5 top-1/2 -translate-y-1/2 rounded-sm bg-card border shadow-none hover:bg-card">
                <ChevronDownIcon size={14} className="text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-24 max-h-64 overflow-y-auto" align="end" alignOffset={-6} sideOffset={12}>
              {fontSizes.map((size) => (
                <DropdownMenuItem key={size} className="text-xs pl-2.5" onClick={() => editor.canvas.onChangeActiveTextboxProperty("fontSize", size)}>
                  {size} px
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Separator orientation="vertical" className="h-8 mx-4" />
      <div className="flex items-center gap-1">
        <Toggle
          pressed={selected.fontWeight === 700}
          onPressedChange={(pressed) => editor.canvas.onChangeActiveTextboxProperty("fontWeight", pressed ? 700 : 400)}
          variant="outline"
          size="sm"
          value="bold"
          aria-label="bold"
          className="data-[state=on]:bg-card data-[state=on]:text-blue-600"
        >
          <BoldIcon size={15} />
        </Toggle>
        <Toggle variant="outline" disabled className="data-[state=on]:bg-card data-[state=on]:text-blue-600" size="sm" value="italic" aria-label="italic">
          <ItalicIcon size={15} />
        </Toggle>
        <Toggle
          pressed={selected.underline}
          onPressedChange={(pressed) => editor.canvas.onChangeActiveTextboxProperty("underline", pressed)}
          variant="outline"
          size="sm"
          value="underline"
          aria-label="underline"
          className="data-[state=on]:bg-card data-[state=on]:text-blue-600"
        >
          <UnderlineIcon size={15} />
        </Toggle>
      </div>
      <Separator orientation="vertical" className="h-8 mx-4" />
      <ToolbarFillOption />
      <Separator orientation="vertical" className="h-8 mx-4" />
      <ToolbarStrokeOption />
      <Separator orientation="vertical" className="h-8 ml-auto mr-4" />
      <ToolbarTimelineOption />
      <Separator orientation="vertical" className="h-8 mx-4" />
      <ToolbarPositionOption />
    </div>
  );
}

export const TextToolbar = observer(_TextToolbar);
