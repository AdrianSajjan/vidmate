import { observer } from "mobx-react";

import { EllipsisIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEditorContext } from "@/context/editor";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const dimensions = [
  { label: "Facebook Feed", height: 1080, width: 1080 },
  { label: "Facebook Story", height: 1920, width: 1080 },
  { label: "Google Banner", height: 540, width: 1080 },
  { label: "Google Interstitial", height: 1080, width: 540 },
];

function _DefaultToolbar() {
  const editor = useEditorContext();

  return (
    <div className="flex items-center h-full w-full">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <span className="text-xs">Format</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="start">
              <DropdownMenuLabel>Page Dimensions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {dimensions.map(({ height, width, label }) => (
                  <DropdownMenuItem key={label} onClick={() => editor.canvas.onUpdateDimensions({ height, width })}>
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Separator orientation="vertical" className="h-8 mx-2.5" />
        <div className="flex items-center gap-1.5">
          <Label className="text-xs">Height</Label>
          <div className="relative">
            <Input className="h-8 w-24 text-xs pr-6" type="number" value={editor.canvas.height} onChange={(event) => editor.canvas.onUpdateDimensions({ height: +event.target.value })} />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">px</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Label className="text-xs">Width</Label>
          <div className="relative">
            <Input className="h-8 w-24 text-xs pr-6" type="number" value={editor.canvas.width} onChange={(event) => editor.canvas.onUpdateDimensions({ width: +event.target.value })} />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">px</span>
          </div>
        </div>
      </div>
      <Separator orientation="vertical" className="h-8 ml-auto mr-5" />
      <div className="flex items-center gap-2.5">
        <Button variant="outline" size="icon" className="gap-1.5">
          <EllipsisIcon size={16} strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  );
}

export const DefaultToolbar = observer(_DefaultToolbar);
