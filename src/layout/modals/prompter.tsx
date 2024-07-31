import { Dialog, DialogContent, DialogOverlay, DialogPortal } from "@radix-ui/react-dialog";
import { observer } from "mobx-react";

import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useEditorContext } from "@/context/editor";

function _AIPromptModal() {
  const editor = useEditorContext();

  return (
    <Dialog open={editor.prompter.modal}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogContent className="fixed left-1/2 top-1/2 z-50 grid w-full max-w-screen-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
          <DialogTitle className="sr-only">Prompt Modal</DialogTitle>
          <DialogDescription className="sr-only">Generate video with the help of AI</DialogDescription>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

export const AIPromptModal = observer(_AIPromptModal);
