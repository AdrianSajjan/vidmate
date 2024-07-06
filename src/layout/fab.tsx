import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEditorContext } from "@/context/editor";
import { PlusIcon } from "lucide-react";
import { observer } from "mobx-react";

function _EditorFAB() {
  const editor = useEditorContext();

  return (
    <div className="absolute bottom-6 left-6 flex items-center gap-2.5">
      <Tabs value={String(editor.page)}>
        <TabsList className="shadow-sm bg-card dark:bg-muted">
          {editor.pages.map((_, index) => (
            <TabsTrigger key={index} value={String(index)} className=" data-[state=active]:bg-blue-600 dark:data-[state=active]:bg-blue-300 data-[state=active]:text-primary-foreground  text-xs h-full px-4">
              Page {index + 1}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <Button
        size="default"
        className="text-xs rounded-lg shadow-sm gap-1.5 border bg-card dark:bg-blue-300  border-blue-600 dark:border-blue-300  text-blue-600 dark:text-black hover:bg-blue-600 dark:hover:bg-blue-300/90 hover:text-white dark:hover:text-black"
      >
        <PlusIcon size={15} />
        <span className="font-medium">Add Page</span>
      </Button>
    </div>
  );
}

export const EditorFAB = observer(_EditorFAB);
