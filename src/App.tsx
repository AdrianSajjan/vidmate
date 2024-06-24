import useMeasure from "react-use-measure";

import { EditorFAB } from "@/layout/fab";
import { EditorFooter } from "@/layout/footer";
import { EditorMenubar } from "@/layout/menubar";
import { EditorSidebar } from "@/layout/sidebar";
import { EditorToolbar } from "@/layout/toolbar";

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
              <EditorFAB />
            </div>
            <EditorFooter />
          </section>
        </main>
      </section>
    </EditorProvider>
  );
}
