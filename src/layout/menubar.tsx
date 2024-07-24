import { observer } from "mobx-react";
import { useMutation } from "@tanstack/react-query";
import { flowResult } from "mobx";
import { toast } from "sonner";

import { ChevronDownIcon, ChevronRightIcon, CloudUploadIcon, Columns2Icon, ImageIcon, MenuIcon, RedoIcon, UndoIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ToggleTheme } from "@/components/ui/theme-toggle";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

import { useEditorContext } from "@/context/editor";
import { useIsTablet } from "@/hooks/use-media-query";
import { createBase64Download, createFileDownload } from "@/lib/utils";
import { fetchExtensionByCodec } from "@/constants/recorder";
import { EditorTemplate } from "@/types/editor";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { maxZoom, minZoom } from "@/constants/editor";
import { mock } from "@/constants/mock";

function _EditorMenubar() {
  const editor = useEditorContext();
  const codec = fetchExtensionByCodec(editor.codec);

  const isTablet = useIsTablet();

  const upload = useMutation({
    mutationFn: async () => {
      const pages = await flowResult(editor.exportTemplate());
      const template = { name: editor.name, id: editor.id, pages } as EditorTemplate;
      createBase64Download(template, "text/json", `template-${Date.now()}.json`);
      return template;
    },
    onSuccess: (data) => mock.upload("template", data),
  });

  const handleExportVideo = async () => {
    try {
      editor.onTogglePreviewModal("open");
      const blob = await flowResult(editor.exportVideo());
      const file = (editor.file || "output") + "." + codec.extension;
      createFileDownload(blob, file);
    } catch (e) {
      const error = e as Error;
      toast.error(error.message || "Failed to export video");
    }
  };

  const handleSaveTemplate = async () => {
    const promise = upload.mutateAsync();
    toast.promise(promise, { loading: "The template is being saved...", success: "The template has been saved successfully", error: "Ran into an error while saving the template" });
  };

  if (!editor.canvas.workspace || !editor.canvas.history) return null;

  return (
    <header className="flex h-14 items-center px-3 bg-card dark:bg-gray-900/40 border-b border-b-border/50 shrink-0">
      <section id="left" className="flex gap-3">
        {!isTablet ? (
          <Drawer>
            <DrawerTrigger asChild>
              <Button size="icon" variant="secondary">
                <MenuIcon size={15} />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DialogTitle className="sr-only"></DialogTitle>
              <DialogDescription className="sr-only"></DialogDescription>
              <div className="max-w-full pt-3 pb-1 divide-y divide-border/50">
                <Button size="sm" className="gap-3 justify-start w-full h-11" variant="ghost" disabled={upload.isPending} onClick={handleSaveTemplate}>
                  <CloudUploadIcon size={15} />
                  <span className="font-medium">Save Template</span>
                  <span className="ml-auto">{editor.saving ? <Spinner className="h-4 w-4 text-primary-foreground" /> : <ChevronRightIcon className="text-gray-400" size={15} />}</span>
                </Button>
                <Button size="sm" className="gap-3 justify-start w-full h-11" variant="ghost" onClick={handleExportVideo}>
                  <ImageIcon size={15} />
                  <span className="font-medium">Export Video</span>
                  <span className="ml-auto">
                    <ChevronRightIcon className="text-gray-400" size={15} />
                  </span>
                </Button>
                <Button size="sm" className="gap-3 justify-start w-full h-11" variant="ghost" onClick={() => editor.onTogglePreviewModal("open")}>
                  <Columns2Icon size={15} />
                  <span className="font-medium">Open Export Preview</span>
                  <span className="ml-auto">
                    <ChevronRightIcon className="text-gray-400" size={15} />
                  </span>
                </Button>
              </div>
            </DrawerContent>
          </Drawer>
        ) : null}
        <div className="flex gap-px">
          <Button variant="secondary" size="sm" className="gap-1.5 rounded-r-none" onClick={() => editor.canvas.history.undo()} disabled={!editor.canvas.history.canUndo}>
            <UndoIcon size={15} />
            <span className="font-medium hidden md:inline-block">Undo</span>
          </Button>
          <Button variant="secondary" size="icon" className="rounded-l-none" onClick={() => editor.canvas.history.redo()} disabled={!editor.canvas.history.canRedo}>
            <RedoIcon size={15} />
          </Button>
        </div>
      </section>
      <section id="right" className="ml-auto flex gap-3">
        <div className="gap-px hidden md:flex">
          <Button variant="secondary" size="icon" className="rounded-r-none" onClick={() => editor.canvas.workspace.changeZoom(editor.canvas.workspace.zoom - 0.05)}>
            <ZoomOutIcon size={15} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="rounded-none gap-1.5 justify-between w-24 lg:w-28">
                <span className="font-medium">{Math.round(editor.canvas.workspace.zoom * 100)}%</span>
                <ChevronDownIcon size={15} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-24 lg:w-28">
              <DropdownMenuGroup>
                {[10, 15, 20, 25, 50, 75, 100, 125, 150, 175, 200, 250].map((percentage) => (
                  <DropdownMenuItem key={percentage} className="text-xs" onClick={() => editor.canvas.workspace.changeZoom(percentage / 100)}>
                    {percentage}%
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="secondary" size="icon" className="rounded-l-none" onClick={() => editor.canvas.workspace.changeZoom(editor.canvas.workspace.zoom + 0.05)}>
            <ZoomInIcon size={16} />
          </Button>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button size="icon" variant="secondary" className="flex md:hidden">
              <ZoomInIcon size={15} />
            </Button>
          </PopoverTrigger>
          <PopoverContent onOpenAutoFocus={(event) => event.preventDefault()} align="end">
            <Label className="text-xs font-medium">Zoom (%)</Label>
            <div className="flex items-center justify-between gap-4">
              <Slider step={5} min={minZoom * 100} max={maxZoom * 100} value={[Math.round(editor.canvas.workspace.zoom * 100)]} onValueChange={([zoom]) => editor.canvas.workspace.changeZoom(zoom / 100)} />
              <Input
                type="number"
                className="h-8 w-16 text-xs"
                value={Math.round(editor.canvas.workspace.zoom * 100)}
                onChange={(event) => (+event.target.value > maxZoom * 100 || +event.target.value < minZoom * 100 ? null : editor.canvas.workspace.changeZoom(+event.target.value / 100))}
              />
            </div>
          </PopoverContent>
        </Popover>
        <Button size="sm" className="gap-2 w-40 hidden sm:flex" disabled={upload.isPending} onClick={handleSaveTemplate}>
          {editor.saving ? <Spinner className="h-4 w-4 text-primary-foreground" /> : <CloudUploadIcon size={15} />}
          <span className="font-medium">Save Template</span>
        </Button>
        <div className="hidden sm:flex gap-px">
          <Button size="sm" className="gap-2 rounded-r-none w-36" onClick={handleExportVideo}>
            <ImageIcon size={15} />
            <span className="font-medium">Export Video</span>
          </Button>
          <Button size="icon" className="rounded-l-none" onClick={() => editor.onTogglePreviewModal("open")}>
            <ChevronDownIcon size={15} />
          </Button>
        </div>
        <ToggleTheme />
      </section>
    </header>
  );
}

export const EditorMenubar = observer(_EditorMenubar);
