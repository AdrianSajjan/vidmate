import useMeasure from "react-use-measure";

import { EditorFAB } from "@/layout/fab";
import { EditorMenubar } from "@/layout/menubar";
import { EditorSidebar } from "@/layout/sidebar";
import { EditorToolbar } from "@/layout/toolbar";
import { EditorTimeline } from "@/layout/timeline";

import { EditorProvider } from "@/context/editor";
import { EditorCanvas } from "@/components/editor";

import "@/lib/fabric";

export function App() {
  const [ref, { height, width }] = useMeasure();

  return (
    <EditorProvider>
      <section className="min-h-screen flex flex-col">
        <EditorMenubar />
        <main className="flex-1 flex w-full">
          <EditorSidebar />
          <section className="flex-1 flex flex-col relative">
            <EditorToolbar />
            <div className="flex-1 relative" ref={ref}>
              <EditorCanvas page={0} height={height} width={width} />
            </div>
            <EditorFAB />
          </section>
        </main>
        <EditorTimeline />
      </section>
    </EditorProvider>
  );
}
