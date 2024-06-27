import { observer } from "mobx-react";
import { BoldIcon, BoxSelectIcon, ChevronDownIcon, EllipsisIcon, ItalicIcon, LayersIcon, LigatureIcon, UnderlineIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { fontSizes } from "@/constants/editor";
import { Toggle } from "@/components/ui/toggle";

import { useEditorContext } from "@/context/editor";
import { cn } from "@/lib/utils";

function _TextToolbar() {
  const editor = useEditorContext();

  const selected = editor.canvas.selected as fabric.Textbox;

  return (
    <div className="flex items-center h-full w-full overflow-x-scroll scrollbar-hidden">
      <div className="flex items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1.5">
              <LigatureIcon size={15} />
              <span>Montserrat</span>
              <ChevronDownIcon size={15} />
            </Button>
          </PopoverTrigger>
        </Popover>
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
      <Separator orientation="vertical" className="h-8 mx-5" />
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
      <Separator orientation="vertical" className="h-8 mx-5" />
      <div className="flex items-center gap-2.5 mr-5">
        <Button
          onClick={() => editor.setActiveSidebarRight(editor.sidebarRight === "fill" ? null : "fill")}
          variant="outline"
          size="sm"
          className={cn("gap-1.5 px-2.5", editor.sidebarRight === "fill" ? "bg-card" : "bg-transparent")}
        >
          <div className="relative">
            <div
              className={cn("h-5 w-5 border rounded-full", !selected.fill ? "opacity-50" : "opacity-100")}
              style={{ backgroundColor: !selected.fill || typeof selected.fill !== "string" ? "#000000" : selected.fill }}
            />
            {!selected.fill ? <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-6 bg-card-foreground -rotate-45" /> : null}
          </div>
          <span className="text-xs font-normal">Fill</span>
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 px-2.5">
          <div className="relative">
            <div className="h-5 w-5 border rounded-full grid place-items-center opacity-50" style={{ backgroundColor: "#000000" }}>
              <div className="h-2 w-2 rounded-full bg-white border" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-6 bg-card-foreground -rotate-45" />
          </div>
          <span className="text-xs font-normal">Stroke</span>
        </Button>
      </div>
      <Separator orientation="vertical" className="h-8 ml-auto mr-5" />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Label className="text-xs text-gray-700">Timeline</Label>
          <div className="relative">
            <Input className="h-8 w-24 text-xs pr-14" />
            <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xs">s</span>
            <Button size="icon" className="h-5 w-5 absolute right-1.5 top-1/2 -translate-y-1/2 rounded-sm bg-card border shadow-none hover:bg-card">
              <ChevronDownIcon size={14} className="text-foreground" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Label className="text-xs text-gray-700">Offset</Label>
          <div className="relative">
            <Input className="h-8 w-24 text-xs pr-14" />
            <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xs">s</span>
            <Button size="icon" className="h-5 w-5 absolute right-1.5 top-1/2 -translate-y-1/2 rounded-sm bg-card border shadow-none hover:bg-card">
              <ChevronDownIcon size={14} className="text-foreground" />
            </Button>
          </div>
        </div>
      </div>
      <Separator orientation="vertical" className="h-8 mx-5" />
      <div className="flex items-center gap-2.5">
        <Button size="sm" variant="outline" className="gap-1.5">
          <LayersIcon size={15} />
          <span>Animations</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <BoxSelectIcon size={15} strokeWidth={1.5} />
              <span className="text-xs">Position</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-48">
            <DropdownMenuLabel>Move</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem>Bring to Front</DropdownMenuItem>
              <DropdownMenuItem>Bring Forwards</DropdownMenuItem>
              <DropdownMenuItem>Send to Back</DropdownMenuItem>
              <DropdownMenuItem>Send Backwards</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Align to Page</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem>Left</DropdownMenuItem>
              <DropdownMenuItem>Center</DropdownMenuItem>
              <DropdownMenuItem>Right</DropdownMenuItem>
              <DropdownMenuItem>Top</DropdownMenuItem>
              <DropdownMenuItem>Middle</DropdownMenuItem>
              <DropdownMenuItem>Bottom</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator orientation="vertical" className="h-8 mx-5" />
      <div className="flex items-center gap-2.5">
        <Button variant="outline" size="icon" className="gap-1.5">
          <EllipsisIcon size={15} strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  );
}

export const TextToolbar = observer(_TextToolbar);
