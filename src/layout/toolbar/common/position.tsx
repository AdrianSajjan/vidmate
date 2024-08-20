import { BoxSelectIcon } from "lucide-react";
import { observer } from "mobx-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEditorContext } from "@/context/editor";
import { align, move } from "@/constants/editor";

function _ToolbarPositionOption() {
  const editor = useEditorContext();

  const handleMoveLayer = (type: "up" | "down" | "bottom" | "top") => {
    editor.canvas.alignment.changeActiveObjectLayer(type);
  };

  const handleAlignToPage = (type: "left" | "center" | "right" | "top" | "middle" | "bottom") => {
    editor.canvas.alignment.alignActiveObjecToPage(type);
  };

  return (
    <div className="flex items-center gap-2.5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="gap-1.5">
            <BoxSelectIcon size={15} strokeWidth={1.5} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-48" align="end">
          <DropdownMenuLabel className="text-xs">Move</DropdownMenuLabel>
          <DropdownMenuGroup>
            {move.map(({ label, value }) => (
              <DropdownMenuItem key={value} onClick={() => handleMoveLayer(value)} className="text-xs">
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs">Align to Page</DropdownMenuLabel>
          <DropdownMenuGroup>
            {align.map(({ label, value }) => (
              <DropdownMenuItem key={value} onClick={() => handleAlignToPage(value)} className="text-xs">
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export const ToolbarPositionOption = observer(_ToolbarPositionOption);
