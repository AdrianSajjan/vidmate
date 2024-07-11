import { Dialog, DialogContent, DialogOverlay, DialogPortal } from "@radix-ui/react-dialog";
import { observer } from "mobx-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { useEditorContext } from "@/context/editor";
import { cn } from "@/lib/utils";
import { ExportProgress } from "@/store/editor";
import { BanIcon, CircleCheckBig } from "lucide-react";

function _EditorPreviewModal() {
  const editor = useEditorContext();

  return (
    <Dialog open={editor.preview}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogContent
          className={cn(
            "fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          )}
        >
          <PreviewModalContent />
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

function _PreviewModalContent() {
  const editor = useEditorContext();

  const handleDownloadVideo = () => {
    const url = URL.createObjectURL(editor.blob!);
    const handle = window.open(url);
    handle?.addEventListener("close", () => URL.revokeObjectURL(url));
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="relative flex items-center justify-center h-64 w-full">
        <img src={editor.frame} className="h-full w-full object-contain" />
      </div>
      <div className="flex flex-col relative">
        <Progress value={editor.progress} className="h-7 rounded-md bg-primary/40" />
        <div className="text-xxs absolute top-1/2 -translate-y-1/2 left-2 flex items-center gap-2">
          <ProgressIcon progress={editor.exporting} />
          <ProgressText progress={editor.exporting} />
        </div>
      </div>
      <div className="flex flex-row gap-4">
        <Button variant="outline" className="flex-1 text-xs" onClick={() => editor.onTogglePreviewModal("close")}>
          Cancel Export
        </Button>
        <Button disabled={!editor.blob} onClick={handleDownloadVideo} variant="default" className="flex-1 text-xs bg-blue-600 hover:bg-blue-600/90 dark:bg-blue-300 dark:hover:bg-blue-300/90">
          Download Video
        </Button>
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
      return <span className="text-xxs text-primary-foreground">In Progress - Rendering Scene</span>;
    case ExportProgress.CaptureVideo:
      return <span className="text-xxs text-primary-foreground">In Progress - Capturing Frames</span>;
    case ExportProgress.CompileVideo:
      return <span className="text-xxs text-primary-foreground">In Progress - Compiling Frames</span>;
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