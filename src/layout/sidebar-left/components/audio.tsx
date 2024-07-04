import { Fragment, MouseEventHandler } from "react";
import { PlusIcon, SearchIcon, XIcon } from "lucide-react";
import { observer } from "mobx-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { useEditorContext } from "@/context/editor";
import { leftSidebarWidth } from "@/constants/layout";

import * as mock from "@/constants/mock";

function _AudioSidebar() {
  const editor = useEditorContext();

  const handleClick =
    (_: string): MouseEventHandler<HTMLButtonElement> =>
    () => {};

  return (
    <div className="h-full" style={{ width: leftSidebarWidth }}>
      <div className="flex items-center justify-between h-14 border-b px-4">
        <h2 className="font-semibold">Audios</h2>
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
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-semibold line-clamp-1">Uploads</h4>
              <Button asChild size="sm" variant="outline" className="h-7 ml-auto bg-card gap-1 pl-2">
                <label>
                  <PlusIcon size={14} />
                  <span>Add File</span>
                  <input hidden type="file" accept="video/*" />
                </label>
              </Button>
              <Button size="sm" variant="link" className="text-blue-600 h-6 font-medium line-clamp-1 px-1.5">
                See All
              </Button>
            </div>
            <div className="flex gap-2.5 items-center overflow-scroll scrollbar-hidden relative">
              {mock.audios.length ? (
                mock.audios.map((image) => (
                  <button key={image} onClick={handleClick(image)} className="group shrink-0 h-16 w-16 border flex items-center justify-center overflow-hidden rounded-md shadow-sm">
                    <img src={image + "?q=75&w=256&auto=format"} crossOrigin="anonymous" className="h-full w-full rounded-md transition-transform group-hover:scale-110" />
                  </button>
                ))
              ) : (
                <Fragment>
                  {Array.from({ length: 3 }, (_, index) => (
                    <Skeleton key={index} className="h-16 flex-1 rounded-md" />
                  ))}
                  <span className="text-xs font-semibold text-foreground/60 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 leading-none">No Videos</span>
                </Fragment>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <h4 className="text-xs font-semibold line-clamp-1">Images</h4>
              <Button size="sm" variant="link" className="text-blue-600 font-medium line-clamp-1 px-1.5">
                See All
              </Button>
            </div>
            <div className="flex gap-2.5 items-center overflow-scroll scrollbar-hidden relative">
              <Fragment>
                {Array.from({ length: 3 }, (_, index) => (
                  <Skeleton key={index} className="h-16 flex-1 rounded-md" />
                ))}
                <span className="text-xs font-semibold text-foreground/60 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">Coming Soon</span>
              </Fragment>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export const AudioSidebar = observer(_AudioSidebar);
