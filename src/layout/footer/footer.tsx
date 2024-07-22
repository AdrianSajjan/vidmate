import { observer } from "mobx-react";
import { useEditorContext } from "@/context/editor";

import { EditorPlayback } from "./components/playback";
import { EditorTimeline } from "./components/timeline";

function _EditorFooter() {
  const editor = useEditorContext();

  if (!editor.canvas.timeline) return null;

  return (
    <footer style={{ height: editor.timelineOpen ? 288 : 64 }} className="flex flex-col bg-card/75 sm:bg-card dark:bg-gray-900/40 sm:dark:bg-gray-900/30 border-t border-t-border/50 shrink-0 overflow-hidden">
      <EditorPlayback />
      <EditorTimeline />
    </footer>
  );
}

export const EditorFooter = observer(_EditorFooter);
