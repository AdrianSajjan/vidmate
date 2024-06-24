import { BoldIcon, BoxSelectIcon, ChevronDownIcon, EllipsisIcon, ItalicIcon, LigatureIcon, UnderlineIcon } from "lucide-react";
import { Fragment } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function TextToolbar() {
  return (
    <Fragment>
      <div className="flex items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1.5">
              <LigatureIcon size={16} />
              <span>Montserrat</span>
              <ChevronDownIcon size={16} />
            </Button>
          </PopoverTrigger>
        </Popover>
        <div className="flex items-center gap-1.5">
          <Label className="text-xs text-gray-700">Size</Label>
          <div className="relative">
            <Input className="h-8 w-24 text-xs pr-14" />
            <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xs">px</span>
            <Button size="icon" className="h-5 w-5 absolute right-1.5 top-1/2 -translate-y-1/2 rounded-sm bg-card border shadow-none hover:bg-card">
              <ChevronDownIcon size={14} className="text-foreground" />
            </Button>
          </div>
        </div>
      </div>
      <Separator orientation="vertical" className="h-8 mx-5" />
      <div className="flex items-center gap-4">
        <ToggleGroup type="multiple">
          <ToggleGroupItem variant="outline" className="data-[state=on]:bg-card data-[state=on]:text-blue-600" size="sm" value="bold" aria-label="bold">
            <BoldIcon size={15} />
          </ToggleGroupItem>
          <ToggleGroupItem variant="outline" className="data-[state=on]:bg-card data-[state=on]:text-blue-600" size="sm" value="italic" aria-label="italic">
            <ItalicIcon size={15} />
          </ToggleGroupItem>
          <ToggleGroupItem variant="outline" className="data-[state=on]:bg-card data-[state=on]:text-blue-600" size="sm" value="underline" aria-label="underline">
            <UnderlineIcon size={15} />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <Separator orientation="vertical" className="h-8 mx-5" />
      <div className="flex items-center gap-2.5">
        <Button variant="outline" size="sm" className="gap-1.5 px-2.5">
          <div className="h-5 w-5 border rounded-full" style={{ backgroundColor: "#000000" }} />
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
      <div className="flex items-center gap-2.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <BoxSelectIcon size={15} strokeWidth={1.5} />
              <span className="text-xs">Position</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
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
          <EllipsisIcon size={16} strokeWidth={1.5} />
        </Button>
      </div>
    </Fragment>
  );
}
