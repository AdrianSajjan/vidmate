import { Dialog, DialogContent, DialogOverlay, DialogPortal } from "@radix-ui/react-dialog";
import { observer } from "mobx-react";
import { BanIcon, CircleCheckBig } from "lucide-react";
import { toast } from "sonner";
import { flowResult } from "mobx";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

import { useEditorContext } from "@/context/editor";
import { ExportProgress } from "@/store/editor";
import { codecs, fetchExtensionByCodec, fps } from "@/constants/recorder";
import { createFileDownload } from "@/lib/utils";

function _EditorPreviewModal() {
  const editor = useEditorContext();

  return (
    <Dialog open={editor.preview}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogContent className="fixed left-1/2 top-1/2 z-50 grid w-full max-w-screen-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
          <DialogTitle className="sr-only">Preview Modal</DialogTitle>
          <DialogDescription className="sr-only">See your video rendering and export preview here</DialogDescription>
          <PreviewModalContent />
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

function _PreviewModalContent() {
  const editor = useEditorContext();

  const codec = fetchExtensionByCodec(editor.codec);

  const handleExportVideo = async () => {
    try {
      const blob = await flowResult(editor.onExportVideo());
      const file = (editor.file || "output") + "." + codec.extension;
      createFileDownload(blob, file);
    } catch (e) {
      const error = e as Error;
      toast.error(error.message || "Failed to export video");
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-7">
        <div className="relative flex items-center justify-center h-96 p-3 w-full bg-transparent-pattern">
          {editor.blob ? (
            <video controls src={URL.createObjectURL(editor.blob)} className="h-full w-full object-contain" />
          ) : editor.frame ? (
            <img src={editor.frame} alt="preview" className="h-full w-full object-contain" />
          ) : null}
        </div>
      </div>
      <div className="col-span-5 flex flex-col">
        <div className="flex flex-col">
          <label className="text-xs font-semibold">Export Settings</label>
          <div className="flex flex-col px-2.5 pt-3.5 gap-3">
            <div className="grid grid-cols-12 items-center">
              <Label className="text-xs col-span-3">FPS</Label>
              <Select value={editor.fps} onValueChange={(fps) => editor.onChangeExportFPS(fps)}>
                <SelectTrigger className="text-xs w-36 col-span-9 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fps.map((fps) => (
                    <SelectItem value={fps} className="text-xs">
                      {fps}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-12 items-center">
              <Label className="text-xs col-span-3">Codec</Label>
              <Select value={editor.codec} onValueChange={(codec) => editor.onChangeExportCodec(codec)}>
                <SelectTrigger className="text-xs w-36 col-span-9 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {codecs.map((codec) => (
                    <SelectItem key={codec} value={codec} className="text-xs">
                      {codec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-12 items-center">
              <Label className="text-xs col-span-3">File Name</Label>
              <div className="flex col-span-9">
                <Input className="flex-1 text-xs h-8 rounded-r-none" placeholder="output" />
                <div className="shrink-0 text-xs h-8 px-3 border grid place-items-center rounded-md rounded-l-none shadow-sm text-muted-foreground">.{codec.extension}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 mt-auto">
          {editor.exporting > ExportProgress.None ? (
            <div className="flex flex-col relative">
              <Progress value={editor.progress} className="h-7 rounded-md bg-gray-300" />
              <div className="text-xxs absolute top-1/2 -translate-y-1/2 left-2 flex items-center gap-2">
                <ProgressIcon progress={editor.exporting} />
                <ProgressText progress={editor.exporting} />
              </div>
            </div>
          ) : null}
          <div className="flex flex-row gap-4">
            <Button variant="outline" className="flex-1 text-xs" onClick={() => editor.onTogglePreviewModal("close")}>
              {editor.exporting > ExportProgress.Completed ? <span>Cancel Export</span> : <span>Close</span>}
            </Button>
            <Button disabled={editor.exporting > ExportProgress.Completed} variant="default" className="flex-1 text-xs bg-primary hover:bg-primary/90" onClick={handleExportVideo}>
              Start Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function _ProgressIcon({ progress }: { progress: ExportProgress }) {
  switch (progress) {
    case ExportProgress.Error:
      return <BanIcon className="h-4 w-4 text-primary-foreground" />;
    case ExportProgress.Completed:
      return <CircleCheckBig className="h-4 w-4 text-primary-foreground" />;
    case ExportProgress.None:
      return null;
    default:
      return <Spinner className="h-4 w-4 text-primary-foreground" />;
  }
}

function _ProgressText({ progress }: { progress: ExportProgress }) {
  switch (progress) {
    case ExportProgress.Error:
      return <span className="text-xxs text-primary-foreground">Error</span>;
    case ExportProgress.Completed:
      return <span className="text-xxs text-primary-foreground">Completed</span>;
    case ExportProgress.StaticCanvas:
      return <span className="text-xxs text-primary-foreground">In Progress - Rendering Video Scene</span>;
    case ExportProgress.CaptureVideo:
      return <span className="text-xxs text-primary-foreground">In Progress - Capturing Video Frames</span>;
    case ExportProgress.CompileVideo:
      return <span className="text-xxs text-primary-foreground">In Progress - Compiling Video Frames</span>;
    case ExportProgress.CaptureAudio:
      return <span className="text-xxs text-primary-foreground">In Progress - Compiling Audio</span>;
    case ExportProgress.CombineMedia:
      return <span className="text-xxs text-primary-foreground">In Progress - Combining Audio and Audio</span>;
    default:
      return null;
  }
}

const ProgressText = observer(_ProgressText);
const ProgressIcon = observer(_ProgressIcon);
const PreviewModalContent = observer(_PreviewModalContent);
export const EditorPreviewModal = observer(_EditorPreviewModal);
