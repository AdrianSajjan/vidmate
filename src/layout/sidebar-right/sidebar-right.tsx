import { AnimatePresence, motion } from "framer-motion";
import { observer } from "mobx-react";

import { useEditorContext } from "@/context/editor";
import { rightSidebarWidth } from "@/constants/layout";

import { FillSidebar } from "./components/fill";
import { StrokeSidebar } from "./components/stroke";
import { ClipMaskSidebar } from "./components/clip";
import { FilterSidebar } from "./components/filters";
import { AnimationSidebar } from "./components/animations";

const sidebarComponentMap: Record<string, () => JSX.Element> = {
  fill: FillSidebar,
  stroke: StrokeSidebar,
  clip: ClipMaskSidebar,
  filters: FilterSidebar,
  animations: AnimationSidebar,
};

function _EditorSidebarRight() {
  const editor = useEditorContext();

  const Sidebar = editor.sidebarRight ? sidebarComponentMap[editor.sidebarRight] : null;

  return (
    <AnimatePresence>
      {Sidebar ? (
        <motion.aside initial={{ width: 0 }} animate={{ width: rightSidebarWidth }} exit={{ width: 0 }} className="overflow-hidden bg-card/75 dark:bg-gray-900/30 border-l shrink-0">
          <Sidebar key={editor.sidebarRight} />
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

export const EditorSidebarRight = observer(_EditorSidebarRight);
