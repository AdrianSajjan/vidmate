import { observer } from "mobx-react";
import { useEditorContext } from "@/context/editor";

import { DefaultToolbar } from "./components/default";
import { TextToolbar } from "./components/text";

function _EditorToolbar() {
  const editor = useEditorContext();

  return (
    <div className="h-14 bg-card/50 border-b px-3.5 shrink-0 overflow-x-scroll">
      {(() => {
        switch (editor.canvas.selected?.type) {
          case "textbox":
            return <TextToolbar />;
          default:
            return <DefaultToolbar />;
        }
      })()}
    </div>
  );
}

export const EditorToolbar = observer(_EditorToolbar);
