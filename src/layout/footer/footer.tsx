import { observer } from "mobx-react";
import { useEditorContext } from "@/context/editor";

import { EditorPlayback } from "./components/playback";
import { EditorTimeline } from "./components/timeline";
import { useIsTablet } from "@/hooks/use-media-query";

function _EditorFooter() {
  const editor = useEditorContext();
  const isTablet = useIsTablet();

  if (!editor.canvas.timeline) return null;

  const expanded = 288;
  const collapsed = isTablet ? 64 : 56;

  return (
    <footer style={{ height: editor.timelineOpen ? expanded : collapsed }} className="flex flex-col bg-card/75 sm:bg-card dark:bg-gray-900/40 sm:dark:bg-gray-900/30 border-t border-t-border/50 shrink-0 overflow-hidden">
      <EditorPlayback />
      <EditorTimeline />
    </footer>
  );
}

export const EditorFooter = observer(_EditorFooter);
