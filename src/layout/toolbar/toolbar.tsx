import { observer } from "mobx-react";

import { DefaultToolbar } from "./components/default";

function _EditorToolbar() {
  return (
    <div className="h-14 bg-card/50 border-b flex items-center px-3.5 shrink-0">
      <DefaultToolbar />
    </div>
  );
}

export const EditorToolbar = observer(_EditorToolbar);
