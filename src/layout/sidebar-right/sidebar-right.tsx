import { observer } from "mobx-react";
import { useEffect } from "react";

import { useEditorContext } from "@/context/editor";

import { AnimationSidebar } from "./components/animations";
import { ClipMaskSidebar } from "./components/clip";
import { FillSidebar } from "./components/fill";
import { FilterSidebar } from "./components/filters";
import { FontSidebar } from "./components/fonts";
import { StrokeSidebar } from "./components/stroke";
import { AISidebar } from "./components/ai";
import { rightSidebarWidth } from "@/constants/layout";

interface SidebarMapValue {
  Component: () => JSX.Element;
  close: (selected?: fabric.Object | null) => boolean;
}

const sidebarComponentMap: Record<string, SidebarMapValue> = {
  fill: {
    Component: FillSidebar,
    close: (selected) => !selected,
  },
  stroke: {
    Component: StrokeSidebar,
    close: (selected) => !selected,
  },
  clip: {
    Component: ClipMaskSidebar,
    close: (selected) => !selected || !(selected.type === "image" || selected.type === "video"),
  },
  filters: {
    Component: FilterSidebar,
    close: (selected) => !selected || !(selected.type === "image" || selected.type === "video"),
  },
  animations: {
    Component: AnimationSidebar,
    close: (selected) => !selected,
  },
  fonts: {
    Component: FontSidebar,
    close: (selected) => !selected || selected.type !== "textbox",
  },
  ai: {
    Component: AISidebar,
    close: (selected) => !selected || !(selected.type === "image" || selected.type === "textbox"),
  },
};

function _EditorSidebarRight() {
  const editor = useEditorContext();
  const selected = editor.canvas.selection?.active;

  const sidebar = editor.sidebarRight ? sidebarComponentMap[editor.sidebarRight] : null;
  const close = sidebar ? sidebar.close(selected) : false;

  useEffect(() => {
    if (!close) return;
    editor.setActiveSidebarRight(null);
  }, [close]);

  if (close) {
    return null;
  }

  return sidebar ? (
    <aside style={{ width: rightSidebarWidth }} className="overflow-hidden bg-card/75 dark:bg-gray-900/30 border-l shrink-0">
      <sidebar.Component key={editor.sidebarRight} />
    </aside>
  ) : null;
}

export const EditorSidebarRight = observer(_EditorSidebarRight);
