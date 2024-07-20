import { observer } from "mobx-react";

import { EditorElementControls } from "@/layout/controls";
import { useInitializeCanvas } from "@/hooks/use-canvas";
import { Spinner } from "@/components/ui/spinner";
import { useEditorContext } from "@/context/editor";
import { cn } from "@/lib/utils";

export interface EditorCanvasProps {
  page: number;
}

function _EditorCanvas({ page }: EditorCanvasProps) {
  const editor = useEditorContext();
  const [ref] = useInitializeCanvas(page);

  const name = `canvas-${page}`;

  return (
    <div className={cn("absolute", editor.page !== page ? "opacity-0 z-0" : "opacity-100 z-10")}>
      <canvas ref={ref} id={name} />
      <EditorActivityIndicator pending={editor.pages[page].template.pending} />
      <EditorElementControls />
    </div>
  );
}

function _EditorActivityIndicator({ pending }: { pending: boolean }) {
  if (!pending) return null;
  return (
    <div className={cn("absolute inset-0 z-10 grid place-items-center pointer-events-none")}>
      <Spinner className="h-12 w-12 stroke-card" />
    </div>
  );
}

const EditorActivityIndicator = observer(_EditorActivityIndicator);
export const EditorCanvas = observer(_EditorCanvas);
