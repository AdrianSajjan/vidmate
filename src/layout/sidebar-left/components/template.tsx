import { useMutation } from "@tanstack/react-query";
import { PlusIcon, SearchIcon, XIcon } from "lucide-react";
import { observer } from "mobx-react";
import { Fragment } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mock, useMockStore } from "@/constants/mock";
import { useEditorContext } from "@/context/editor";
import { createInstance, createPromise } from "@/lib/utils";
import { EditorTemplate } from "@/types/editor";
import { useFetchVideoTemplates } from "@/api/assets";

function _TemplateSidebar() {
  const editor = useEditorContext();

  return (
    <div className="h-full w-full">
      <div className="flex items-center justify-between h-14 border-b px-4">
        <h2 className="font-semibold">Templates</h2>
        <Button size="icon" variant="outline" className="bg-card h-7 w-7" onClick={() => editor.setActiveSidebarLeft(null)}>
          <XIcon size={16} />
        </Button>
      </div>
      <section className="sidebar-container pb-4">
        <TemplateSidebarContent />
      </section>
    </div>
  );
}

function _TemplateSidebarContent() {
  const editor = useEditorContext();

  switch (editor.mode) {
    case "creator":
      return (
        <Tabs defaultValue="local">
          <div className="px-3 pt-4 pb-6 flex flex-col gap-4">
            <div className="relative">
              <Input placeholder="Search..." className="text-xs pl-8" />
              <SearchIcon size={15} className="absolute top-1/2 -translate-y-1/2 left-2.5 text-foreground/60" />
            </div>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger className="text-xs h-full" value="cloud">
                Cloud
              </TabsTrigger>
              <TabsTrigger className="text-xs h-full" value="local">
                Local
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="cloud" className="mt-0 flex flex-col gap-6">
            <CloudTemplateContent />
          </TabsContent>
          <TabsContent value="local" className="mt-0 flex flex-col gap-6">
            <LocalTemplateContent />
          </TabsContent>
        </Tabs>
      );

    case "adapter":
      return (
        <Fragment>
          <div className="px-3 pt-4 pb-6 flex flex-col gap-4">
            <div className="relative">
              <Input placeholder="Search..." className="text-xs pl-8" />
              <SearchIcon size={15} className="absolute top-1/2 -translate-y-1/2 left-2.5 text-foreground/60" />
            </div>
          </div>
          <CloudTemplateContent />
        </Fragment>
      );
  }
}

function _CloudTemplateContent() {
  const editor = useEditorContext();
  const query = useFetchVideoTemplates({ limit: 50, is_published: editor.mode === "adapter" });

  return (
    <div className="px-3 grid grid-cols-2 gap-4 relative">
      {!query.data || !query.data.pages.flat().length ? (
        <Fragment>
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton className="w-full aspect-square rounded-md" key={index} />
          ))}
          <span className="text-xs font-semibold text-foreground/60 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 line-clamp-1">Coming Soon</span>
        </Fragment>
      ) : (
        query.data.pages.map((templates) => {
          return templates.map((template) => (
            <button className="w-full aspect-square rounded-md overflow-hidden group border" key={template.id} onClick={() => editor.loadTemplate(template, "replace")}>
              <img src={template.pages.at(0)!.thumbnail} alt={template.name} className="group-hover:scale-110 transition-transform" />
            </button>
          ));
        })
      )}
    </div>
  );
}

function _LocalTemplateContent() {
  const store = useMockStore();
  const editor = useEditorContext();

  const loadJSON = useMutation({
    mutationFn: async (file: File) => {
      return createPromise<EditorTemplate | EditorTemplate[]>((resolve, reject) => {
        const reader = createInstance(FileReader);
        reader.addEventListener("load", async () => {
          if (!reader.result) return reject();
          resolve(JSON.parse(reader.result as string));
        });
        reader.readAsText(file);
      });
    },
    onSuccess: (template) => {
      if (Array.isArray(template)) {
        template.map((template) => mock.upload("template", template));
      } else {
        mock.upload("template", template);
        editor.loadTemplate(template, "reset");
      }
    },
  });

  const handleLoadTemplate = (template: EditorTemplate) => {
    editor.loadTemplate(template, "replace");
  };

  const handleLoadJSON = async (files: FileList | null) => {
    if (!files || !files.length) return;
    await loadJSON.mutateAsync(files[0]);
  };

  return (
    <Fragment>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-3">
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
      <div className="px-3 grid grid-cols-2 gap-4 relative">
        {store.templates.length ? (
          store.templates.map((template) => (
            <button className="w-full aspect-square rounded-md overflow-hidden group border" key={template.id} onClick={() => handleLoadTemplate(template)}>
              <img src={template.pages.at(0)!.thumbnail} alt={template.name} className="group-hover:scale-110 transition-transform" />
            </button>
          ))
        ) : (
          <Fragment>
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton className="w-full aspect-square rounded-md" key={index} />
            ))}
            <span className="text-xs font-semibold text-foreground/60 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 line-clamp-1">No local templates</span>
          </Fragment>
        )}
      </div>
    </Fragment>
  );
}

export const TemplateSidebar = observer(_TemplateSidebar);
const CloudTemplateContent = observer(_CloudTemplateContent);
const LocalTemplateContent = observer(_LocalTemplateContent);
const TemplateSidebarContent = observer(_TemplateSidebarContent);
