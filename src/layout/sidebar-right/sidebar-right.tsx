import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { observer } from "mobx-react";

import { useEditorContext } from "@/context/editor";
import { rightSidebarWidth } from "@/constants/layout";

import { FillSidebar } from "./components/fill";
import { FontSidebar } from "./components/fonts";
import { StrokeSidebar } from "./components/stroke";
import { ClipMaskSidebar } from "./components/clip";
import { FilterSidebar } from "./components/filters";
import { AnimationSidebar } from "./components/animations";

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
};

function _EditorSidebarRight() {
  const editor = useEditorContext();
  const selected = editor.canvas.selected;

  const sidebar = editor.sidebarRight ? sidebarComponentMap[editor.sidebarRight] : null;
  const close = sidebar ? sidebar.close(selected) : false;

  useEffect(() => {
    if (!close) return;
    editor.setActiveSidebarRight(null);
  }, [close]);

  if (close) {
    return null;
  }

  return (
    <AnimatePresence>
      {sidebar ? (
        <motion.aside initial={{ width: 0 }} animate={{ width: rightSidebarWidth }} exit={{ width: 0 }} className="overflow-hidden bg-card/75 dark:bg-gray-900/30 border-l shrink-0">
          <sidebar.Component key={editor.sidebarRight} />
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

export const EditorSidebarRight = observer(_EditorSidebarRight);
