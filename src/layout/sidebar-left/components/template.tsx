import { SearchIcon, XIcon } from "lucide-react";
import { observer } from "mobx-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEditorContext } from "@/context/editor";
import { Skeleton } from "@/components/ui/skeleton";
import { Fragment } from "react";
import { leftSidebarWidth } from "@/constants/layout";

function _TemplateSidebar() {
  const editor = useEditorContext();

  return (
    <div className="h-full" style={{ width: leftSidebarWidth }}>
      <div className="flex items-center justify-between h-14 border-b px-4">
        <h2 className="font-semibold">Templates</h2>
        <Button size="icon" variant="outline" className="bg-card h-7 w-7" onClick={() => editor.setActiveSidebarLeft(null)}>
          <XIcon size={16} />
        </Button>
      </div>
      <section className="sidebar-container">
        <div className="px-3 pt-4 pb-6">
          <div className="relative">
            <Input placeholder="Search..." className="text-xs pl-8" />
            <SearchIcon size={15} className="absolute top-1/2 -translate-y-1/2 left-2.5 text-foreground/60" />
          </div>
        </div>
        <div className="px-3 grid grid-cols-2 gap-4 relative">
          <Fragment>
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton className="w-full aspect-square rounded-md" key={index} />
            ))}
            <span className="text-xs font-semibold text-foreground/60 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 leading-none line-clamp-1">Coming Soon</span>
          </Fragment>
        </div>
      </section>
    </div>
  );
}

export const TemplateSidebar = observer(_TemplateSidebar);
