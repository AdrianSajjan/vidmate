import { Fragment } from "react";
import { SearchIcon, XIcon } from "lucide-react";
import { observer } from "mobx-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEditorContext } from "@/context/editor";
import { basicShapes } from "@/constants/elements";
import { Skeleton } from "@/components/ui/skeleton";
import { leftSidebarWidth } from "@/constants/layout";

function _ElementSidebar() {
  const editor = useEditorContext();

  return (
    <div className="h-full" style={{ width: leftSidebarWidth }}>
      <div className="flex items-center justify-between h-14 border-b px-4">
        <h2 className="font-semibold">Elements</h2>
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
        <div className="px-3 flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <h4 className="text-xs font-semibold line-clamp-1">Basic Shapes</h4>
              <Button size="sm" variant="link" className="text-blue-600 font-medium line-clamp-1">
                See All
              </Button>
            </div>
            <div className="flex gap-2.5 items-center overflow-scroll scrollbar-hidden">
              {basicShapes.map(({ name, path }) => (
                <button
                  key={name}
                  onClick={() => editor.canvas.onAddShapePath(path, name)}
                  className="shrink-0 h-16 w-16 border flex items-center justify-center overflow-hidden rounded-md p-2 text-gray-800/80 dark:text-gray-100/80 transition-colors shadow-sm hover:bg-card hover:text-gray-800 dark:hover:text-gray-100"
                >
                  <svg width="48" viewBox="0 0 48 48" aria-label={name} fill="currentColor" className="h-full w-full">
                    <path d={path} className="h-full" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <h4 className="text-xs font-semibold line-clamp-1">Abstract Shapes</h4>
              <Button size="sm" variant="link" className="text-blue-600 font-medium line-clamp-1">
                See All
              </Button>
            </div>
            <div className="flex gap-2.5 items-center overflow-scroll relative scrollbar-hidden">
              <Fragment>
                {Array.from({ length: 3 }, (_, index) => (
                  <Skeleton key={index} className="h-16 flex-1 rounded-md" />
                ))}
                <span className="text-xs font-semibold text-foreground/60 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">Coming soon</span>
              </Fragment>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export const ElementSidebar = observer(_ElementSidebar);
