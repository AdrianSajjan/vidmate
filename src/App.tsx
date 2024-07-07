import "@/fabric/initialize";

import useMeasure from "react-use-measure";

import { EditorFAB } from "@/layout/fab";
import { EditorFooter } from "@/layout/footer";
import { EditorMenubar } from "@/layout/menubar";
import { EditorToolbar } from "@/layout/toolbar";
import { EditorSidebarLeft } from "@/layout/sidebar-left";
import { EditorSidebarRight } from "@/layout/sidebar-right";
import { EditorProvider } from "@/context/editor";

import { Toaster } from "@/components/ui/sonner";
import { EditorCanvas } from "@/components/editor";
import { TooltipProvider } from "@/components/ui/tooltip";

export function App() {
  const [ref, { height, width }] = useMeasure();

  return (
    <EditorProvider>
      <TooltipProvider delayDuration={300}>
        <section className="h-screen overflow-hidden flex flex-col">
          <EditorMenubar />
          <main className="flex-1 flex w-full">
            <EditorSidebarLeft />
            <section className="flex-1 flex flex-col relative w-0">
              <EditorToolbar />
              <div className="flex-1 relative" ref={ref}>
                <EditorCanvas page={0} height={height} width={width} />
                <EditorFAB />
                <Toaster richColors position="bottom-right" offset={24} visibleToasts={6} />
              </div>
              <EditorFooter />
            </section>
            <EditorSidebarRight />
          </main>
        </section>
      </TooltipProvider>
    </EditorProvider>
  );
}
