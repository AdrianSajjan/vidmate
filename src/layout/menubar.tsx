import { ChevronDownIcon, ImageIcon, RedoIcon, UndoIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ToggleTheme } from "@/components/ui/theme-toggle";

export function EditorMenubar() {
  return (
    <header className="flex h-14 items-center px-3 bg-card dark:bg-gray-900/40 border-b shrink-0">
      <section id="left" className="flex gap-3">
        <div className="flex gap-px">
          <Button variant="secondary" size="sm" className="gap-1.5 rounded-r-none">
            <UndoIcon size={16} />
            <span>Undo</span>
          </Button>
          <Button variant="secondary" size="icon" className="rounded-l-none">
            <RedoIcon size={16} />
          </Button>
        </div>
      </section>
      <section id="right" className="ml-auto flex gap-3">
        <div className="flex gap-px">
          <Button variant="secondary" size="icon" className="rounded-r-none">
            <ZoomOutIcon size={16} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="rounded-none gap-1.5 justify-between w-32">
                <span>Auto</span>
                <ChevronDownIcon size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuItem>Auto Fit Page</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>Fit Page</DropdownMenuItem>
                <DropdownMenuItem>Fit Selection</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>50% Zoom</DropdownMenuItem>
                <DropdownMenuItem>100% Zoom</DropdownMenuItem>
                <DropdownMenuItem>200% Zoom</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="secondary" size="icon" className="rounded-l-none">
            <ZoomInIcon size={16} />
          </Button>
        </div>
        <div className="flex gap-px">
          <Button size="sm" className="gap-1.5 rounded-r-none bg-blue-600 hover:bg-blue-600/90 dark:bg-blue-300 dark:hover:bg-blue-300/90">
            <ImageIcon size={16} />
            <span>Export Template</span>
          </Button>
          <Button size="icon" className="rounded-l-none bg-blue-600 hover:bg-blue-600/90 dark:bg-blue-300 dark:hover:bg-blue-300/90">
            <ChevronDownIcon size={16} />
          </Button>
        </div>
        <ToggleTheme />
      </section>
    </header>
  );
}
