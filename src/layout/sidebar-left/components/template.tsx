import { observer } from "mobx-react";
import { Fragment } from "react";
import { flowResult } from "mobx";
import { PlusIcon, SearchIcon, XIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEditorContext } from "@/context/editor";
import { Skeleton } from "@/components/ui/skeleton";
import { leftSidebarWidth } from "@/constants/layout";
import { createInstance, createPromise } from "@/lib/utils";
import { EditorTemplate } from "@/types/editor";
import { toast } from "sonner";

function _TemplateSidebar() {
  const editor = useEditorContext();

  const loadJSON = useMutation({
    mutationFn: async (file: File) => {
      createPromise<void>((resolve, reject) => {
        const reader = createInstance(FileReader);
        reader.addEventListener("load", async () => {
          if (!reader.result) return reject();
          const template: EditorTemplate = JSON.parse(reader.result as string);
          await flowResult(editor.loadTemplate(template));
          resolve();
        });
        reader.readAsText(file);
      });
    },
  });

  const handleLoadJSON = (files: FileList | null) => {
    if (!files || !files.length) return;
    const promise = loadJSON.mutateAsync(files[0]);
    toast.promise(promise, { loading: "The JSON template is being loaded", success: "The JSON template has been loaded", error: "Ran into an error while loading the template" });
  };

  return (
    <div className="h-full" style={{ width: leftSidebarWidth }}>
      <div className="flex items-center justify-between h-14 border-b px-4">
        <h2 className="font-semibold">Templates</h2>
        <Button size="icon" variant="outline" className="bg-card h-7 w-7" onClick={() => editor.setActiveSidebarLeft(null)}>
          <XIcon size={16} />
        </Button>
      </div>
      <section className="sidebar-container">
        <div className="px-3 pt-4 pb-6 flex flex-col gap-4">
          <div className="relative">
            <Input placeholder="Search..." className="text-xs pl-8" />
            <SearchIcon size={15} className="absolute top-1/2 -translate-y-1/2 left-2.5 text-foreground/60" />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <Button asChild size="sm" variant="outline" className="h-7 bg-card gap-1 pl-2 w-full">
              <label>
                <PlusIcon size={14} />
                <span>Load JSON</span>
                <input hidden type="file" accept="application/json" onChange={(event) => handleLoadJSON(event.target.files)} />
              </label>
            </Button>
            <Button asChild size="sm" variant="outline" className="h-7 bg-card gap-1 pl-2 w-full opacity-50 pointer-events-none">
              <label>
                <PlusIcon size={14} />
                <span>Load PSD</span>
                <input hidden type="file" accept="image/*" onChange={() => {}} />
              </label>
            </Button>
          </div>
        </div>

        <div className="px-3 grid grid-cols-2 gap-4 relative">
          <Fragment>
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton className="w-full aspect-square rounded-md" key={index} />
            ))}
            <span className="text-xs font-semibold text-foreground/60 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 line-clamp-1">Coming Soon</span>
          </Fragment>
        </div>
      </section>
    </div>
  );
}

export const TemplateSidebar = observer(_TemplateSidebar);
