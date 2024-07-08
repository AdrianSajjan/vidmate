import { PlusIcon, SearchIcon, XIcon } from "lucide-react";
import { flowResult } from "mobx";
import { observer } from "mobx-react";
import { Fragment, MouseEventHandler } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { leftSidebarWidth } from "@/constants/layout";
import { useEditorContext } from "@/context/editor";
import { isImageLoaded } from "@/lib/utils";
import { mock, useMockStore } from "@/constants/mock";
import { uploadAssetToS3 } from "@/api/upload";
import { extractThumbnailFromVideoURL } from "@/lib/media";

function _VideoSidebar() {
  const store = useMockStore();
  const editor = useEditorContext();

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const source = await uploadAssetToS3(file);
      const thumbnail = await extractThumbnailFromVideoURL(source);
      return { source, thumbnail };
    },
    onSuccess: ({ source, thumbnail }) => mock.upload("video", source, thumbnail),
  });

  const handleUpload = (files: FileList | null) => {
    if (!files || !files.item(0)) return;
    toast.promise(upload.mutateAsync(files.item(0)!), {
      loading: `Your video asset is being uploaded...`,
      success: `Video has been successfully uploaded`,
      error: `Ran into an error while uploading the video`,
    });
  };

  const handleClick =
    (source: string): MouseEventHandler<HTMLButtonElement> =>
    async (event) => {
      const thumbnail = event.currentTarget.querySelector("img");
      if (!thumbnail || !isImageLoaded(thumbnail)) {
        toast.promise(flowResult(editor.canvas.onAddVideoFromSource(source)), {
          loading: "The video asset is being loaded...",
          success: () => "The video asset has been added to artboard",
          error: () => "Ran into an error adding the video asset",
        });
      } else {
        toast.promise(flowResult(editor.canvas.onAddVideoWithThumbail(source, thumbnail)), {
          error: () => "Ran into an error adding the video asset",
        });
      }
    };

  return (
    <div className="h-full" style={{ width: leftSidebarWidth }}>
      <div className="flex items-center justify-between h-14 border-b px-4">
        <h2 className="font-semibold">Videos</h2>
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
                  <input hidden type="file" accept="video/*" onChange={(event) => handleUpload(event.target.files)} />
                </label>
              </Button>
              <Button size="sm" variant="link" className="text-blue-600 h-6 font-medium line-clamp-1 px-1.5">
                See All
              </Button>
            </div>
            <div className="flex gap-2.5 items-center overflow-scroll scrollbar-hidden relative">
              {store.videos.length ? (
                store.videos.map(({ source, thumbnail }) => (
                  <button key={source} onClick={handleClick(source)} className="group shrink-0 h-16 w-16 border flex items-center justify-center overflow-hidden rounded-md shadow-sm">
                    <img src={thumbnail} crossOrigin="anonymous" className="h-full w-full rounded-md transition-transform group-hover:scale-110" />
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
              <h4 className="text-xs font-semibold line-clamp-1">Videos</h4>
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

export const VideoSidebar = observer(_VideoSidebar);
