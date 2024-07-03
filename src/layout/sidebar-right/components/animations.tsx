import { useEffect } from "react";
import { XIcon } from "lucide-react";
import { observer } from "mobx-react";

import { Button } from "@/components/ui/button";
import { rightSidebarWidth } from "@/constants/layout";
import { useEditorContext } from "@/context/editor";

function _AnimationSidebar() {
  const editor = useEditorContext();
  const selected = editor.canvas.selected as fabric.Image | null;

  useEffect(() => {
    if (!selected) editor.setActiveSidebarRight(null);
  }, [selected, editor]);

  return (
    <div className="h-full" style={{ width: rightSidebarWidth }}>
      <div className="flex items-center h-14 border-b px-4 gap-2.5">
        <h2 className="font-semibold">Animations</h2>
        <Button size="icon" variant="outline" className="bg-card h-7 w-7 ml-auto" onClick={() => editor.setActiveSidebarRight(null)}>
          <XIcon size={15} />
        </Button>
      </div>
      <section className="sidebar-container"></section>
    </div>
  );
}

export const AnimationSidebar = observer(_AnimationSidebar);
