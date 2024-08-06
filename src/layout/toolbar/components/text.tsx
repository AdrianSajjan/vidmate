import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  ArrowDownZAIcon,
  BoldIcon,
  CaseLowerIcon,
  CaseUpperIcon,
  ChevronDownIcon,
  ItalicIcon,
  LigatureIcon,
  UnderlineIcon,
  WholeWordIcon,
} from "lucide-react";
import { observer } from "mobx-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

import { fontSizes } from "@/constants/editor";
import { useEditorContext } from "@/context/editor";
import { cn } from "@/lib/utils";

import { ToolbarFillOption } from "../common/fill";
import { ToolbarPositionOption } from "../common/position";
import { ToolbarStrokeOption } from "../common/stroke";
import { ToolbarTimelineOption } from "../common/timeline";
import { ToolbarOpacityOption } from "../common/opacity";

function _TextToolbar() {
  const editor = useEditorContext();
  const selected = editor.canvas.selection.active as fabric.Textbox;

  return (
    <div className="flex items-center h-full w-full overflow-x-scroll scrollbar-hidden">
      <div className="flex items-center gap-4">
        <Button
          size="sm"
          variant="outline"
          className={cn("gap-1.5 justify-start px-2.5", editor.sidebarRight === "fonts" ? "bg-card" : "bg-transparent")}
          onClick={() => editor.setActiveSidebarRight(editor.sidebarRight === "fonts" ? null : "fonts")}
        >
          <LigatureIcon size={15} className="shrink-0" />
          <span className="text-start text-ellipsis whitespace-nowrap overflow-hidden w-20">{selected.fontFamily || "Inter"}</span>
          <ChevronDownIcon size={15} className="ml-auto shrink-0" />
        </Button>
        <div className="relative">
          <Input
            className="h-8 w-28 text-xs pr-[3.25rem] stepper-hidden"
            type="number"
            value={selected.fontSize! * selected.scaleY!}
            onChange={(event) => (+event.target.value <= 0 ? null : editor.canvas.onChangeActiveTextboxProperty("fontSize", +event.target.value / selected.scaleY!))}
          />
          <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xs">px</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" className="h-5 w-5 absolute right-1.5 top-1/2 -translate-y-1/2 rounded-sm bg-card border shadow-none hover:bg-card">
                <ChevronDownIcon size={14} className="text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-24 max-h-64 overflow-y-auto" align="end" alignOffset={-6} sideOffset={12}>
              {fontSizes.map((size) => (
                <DropdownMenuItem key={size} className="text-xs pl-2.5" onClick={() => editor.canvas.onChangeActiveTextboxProperty("fontSize", Math.floor(size / selected.scaleY!))}>
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
          className="data-[state=on]:bg-card data-[state=on]:text-primary"
        >
          <BoldIcon size={15} />
        </Toggle>
        <Toggle
          pressed={selected.fontStyle === "italic"}
          onPressedChange={(pressed) => editor.canvas.onChangeActiveTextboxProperty("fontStyle", pressed ? "italic" : "normal")}
          variant="outline"
          className="data-[state=on]:bg-card data-[state=on]:text-primary"
          size="sm"
          value="italic"
          aria-label="italic"
        >
          <ItalicIcon size={15} />
        </Toggle>
        <Toggle
          pressed={selected.underline}
          onPressedChange={(pressed) => editor.canvas.onChangeActiveTextboxProperty("underline", pressed)}
          variant="outline"
          size="sm"
          value="underline"
          aria-label="underline"
          className="data-[state=on]:bg-card data-[state=on]:text-primary"
        >
          <UnderlineIcon size={15} />
        </Toggle>
      </div>
      <Separator orientation="vertical" className="h-8 mx-4" />
      <ToggleGroup type="single" value={selected.textAlign} onValueChange={(value) => (value ? editor.canvas.onChangeActiveTextboxProperty("textAlign", value) : null)} className="flex items-center gap-1">
        <ToggleGroupItem variant="outline" size="sm" value="left" aria-label="left" className="data-[state=on]:bg-card data-[state=on]:text-primary">
          <AlignLeftIcon size={15} />
        </ToggleGroupItem>
        <ToggleGroupItem variant="outline" size="sm" value="center" aria-label="center" className="data-[state=on]:bg-card data-[state=on]:text-primary">
          <AlignCenterIcon size={15} />
        </ToggleGroupItem>
        <ToggleGroupItem variant="outline" size="sm" value="right" aria-label="right" className="data-[state=on]:bg-card data-[state=on]:text-primary">
          <AlignRightIcon size={15} />
        </ToggleGroupItem>
        <ToggleGroupItem variant="outline" size="sm" value="justify" aria-label="justify" className="data-[state=on]:bg-card data-[state=on]:text-primary">
          <AlignJustifyIcon size={15} />
        </ToggleGroupItem>
      </ToggleGroup>
      <Separator orientation="vertical" className="h-8 mx-4" />
      <ToggleGroup type="single" value={selected.textTransform} onValueChange={(value) => editor.canvas.onChangeActiveTextboxProperty("textTransform", value)} className="flex items-center gap-1">
        <ToggleGroupItem variant="outline" size="sm" value="uppercase" aria-label="uppercase" className="data-[state=on]:bg-card data-[state=on]:text-primary">
          <CaseUpperIcon size={15} />
        </ToggleGroupItem>
        <ToggleGroupItem variant="outline" size="sm" value="lowercase" aria-label="lowercase" className="data-[state=on]:bg-card data-[state=on]:text-primary">
          <CaseLowerIcon size={15} />
        </ToggleGroupItem>
      </ToggleGroup>
      <Separator orientation="vertical" className="h-8 mx-4" />
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button size="icon" variant="outline" aria-label="letter-spacing" className="data-[state=open]:bg-card">
              <WholeWordIcon size={15} />
            </Button>
          </PopoverTrigger>
          <PopoverContent onOpenAutoFocus={(event) => event.preventDefault()} className="pt-2 pb-3 px-3" align="center">
            <Label className="text-xs font-medium">Letter Spacing</Label>
            <div className="flex items-center justify-between gap-4">
              <Slider min={0} max={100} value={[selected.charSpacing!]} onValueChange={([charSpacing]) => editor.canvas.onChangeActiveTextboxProperty("charSpacing", charSpacing)} />
              <Input
                type="number"
                className="h-8 w-16 text-xs"
                value={selected.charSpacing}
                onChange={(event) => (+event.target.value < 0 || +event.target.value > 100 ? null : editor.canvas.onChangeActiveTextboxProperty("charSpacing", +event.target.value))}
              />
            </div>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button size="icon" variant="outline" aria-label="line-height" className="data-[state=open]:bg-card">
              <ArrowDownZAIcon size={15} />
            </Button>
          </PopoverTrigger>
          <PopoverContent onOpenAutoFocus={(event) => event.preventDefault()} className="pt-2 pb-3 px-3" align="center">
            <Label className="text-xs font-medium">Line Height</Label>
            <div className="flex items-center justify-between gap-4">
              <Slider min={0.5} max={2.5} step={0.02} value={[selected.lineHeight!]} onValueChange={([lineHeight]) => editor.canvas.onChangeActiveTextboxProperty("lineHeight", lineHeight)} />
              <Input
                step={0.02}
                type="number"
                className="h-8 w-20 text-xs"
                value={selected.lineHeight}
                onChange={(event) => (+event.target.value < 0.5 || +event.target.value > 2.5 ? null : editor.canvas.onChangeActiveTextboxProperty("lineHeight", +event.target.value))}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <Separator orientation="vertical" className="h-8 mx-4" />
      <ToolbarFillOption />
      <Separator orientation="vertical" className="h-8 mx-4" />
      <ToolbarStrokeOption />
      <Separator orientation="vertical" className="h-8 mx-4" />
      <ToolbarOpacityOption />
      <Separator orientation="vertical" className="h-8 ml-auto mr-4" />
      <ToolbarTimelineOption />
      <Separator orientation="vertical" className="h-8 mx-4" />
      <ToolbarPositionOption />
    </div>
  );
}

export const TextToolbar = observer(_TextToolbar);
