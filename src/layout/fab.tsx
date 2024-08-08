import { PlusIcon, TrashIcon } from "lucide-react";
import { observer } from "mobx-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEditorContext } from "@/context/editor";
import { cn } from "@/lib/utils";

function _EditorFAB() {
  const editor = useEditorContext();

  return (
    <div className={cn("absolute bottom-3 left-3 sm:bottom-6 sm:left-6 hidden flex-row-reverse items-center gap-2.5 z-20", editor.canvas.timeline?.playing ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100")}>
      <Tabs value={String(editor.page)} onValueChange={(value) => editor.onChangeActivePage(+value)}>
        <TabsList className="shadow-sm bg-card dark:bg-muted">
          {editor.pages.map((_, index) => (
            <TabsTrigger key={index} value={String(index)} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-none text-xs h-full px-4">
              Page {index + 1}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <Button
        size="default"
        onClick={() => editor.addPage()}
        disabled={editor.pages.length > 3}
        className="text-xs rounded-lg shadow-sm gap-1.5 border bg-card dark:bg-primary border-primary text-primary dark:text-black hover:bg-primary dark:hover:bg-blue-primary/90 hover:text-white"
      >
        <PlusIcon size={15} />
        <span className="font-medium">Add</span>
      </Button>
      <Button
        size="icon"
        disabled={editor.pages.length === 1}
        onClick={() => editor.deleteActivePage()}
        className="h-9 w-9 shadow-sm border bg-card border-destructive dark:bg-destructive text-destructive dark:text-white hover:bg-destructive dark:hover:bg-blue-destructive/90 hover:text-white"
      >
        <TrashIcon size={15} />
      </Button>
    </div>
  );
}

export const EditorFAB = observer(_EditorFAB);
