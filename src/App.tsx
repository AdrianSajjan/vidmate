import "@/fabric/initialize";
import "@/config/transformers";

import { useEffect } from "react";
import { observer } from "mobx-react";

import { EditorFAB } from "@/layout/fab";
import { EditorFooter } from "@/layout/footer";
import { EditorMenubar } from "@/layout/menubar";
import { EditorToolbar } from "@/layout/toolbar";
import { EditorSidebarLeft } from "@/layout/sidebar-left";
import { EditorSidebarRight } from "@/layout/sidebar-right";
import { EditorPreviewModal } from "@/layout/modals/preview";
import { EditorProvider, useEditorContext } from "@/context/editor";

import { Toaster } from "@/components/ui/sonner";
import { EditorCanvas, EditorRecorder } from "@/components/editor";
import { Spinner } from "@/components/ui/spinner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function App() {
  return (
    <TooltipProvider delayDuration={300}>
      <EditorProvider>
        <Editor />
      </EditorProvider>
    </TooltipProvider>
  );
}

function _Editor() {
  const editor = useEditorContext();

  useEffect(() => {
    editor.initialize();
  }, []);

  switch (editor.status) {
    case "pending":
    case "uninitialized":
      return (
        <section className="h-screen grid place-items-center">
          <div className="flex flex-col gap-2">
            <Spinner size="md" />
            <span className="text-sm font-medium">Initializing editor</span>
          </div>
        </section>
      );

    case "complete":
      return (
        <section className="h-screen overflow-hidden flex flex-col select-none">
          <EditorMenubar />
          <main className="flex-1 flex w-full">
            <EditorSidebarLeft />
            <section className="flex-1 flex flex-col relative w-0 pb-16 sm:pb-0">
              <EditorToolbar />
              <div className="flex-1 relative" id="workspace">
                {editor.pages.map((page, index) => (
                  <EditorCanvas page={index} key={page.id} />
                ))}
                <EditorRecorder />
                <EditorFAB />
                <EditorPreviewModal />
                <Toaster richColors position="bottom-right" offset={24} visibleToasts={6} />
              </div>
              <EditorFooter />
            </section>
            <EditorSidebarRight />
          </main>
        </section>
      );

    case "error":
      return (
        <section className="h-screen grid place-items-center">
          <span className="text-sm font-medium text-destructive">Your browser doesn't support the editor</span>
        </section>
      );
  }
}

const Editor = observer(_Editor);
