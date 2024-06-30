import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BoxSelectIcon } from "lucide-react";
import { observer } from "mobx-react";

function _ToolbarPositionOption() {
  return (
    <div className="flex items-center gap-2.5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="gap-1.5">
            <BoxSelectIcon size={15} strokeWidth={1.5} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-48" align="end">
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
  );
}

export const ToolbarPositionOption = observer(_ToolbarPositionOption);
