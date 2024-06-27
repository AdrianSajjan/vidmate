import { AnimatePresence, motion } from "framer-motion";
import { observer } from "mobx-react";

import { useEditorContext } from "@/context/editor";
import { rightSidebarWidth } from "@/constants/layout";

import { FillSidebar } from "./components/fill";

const sidebarComponentMap: Record<string, () => JSX.Element> = {
  fill: FillSidebar,
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
