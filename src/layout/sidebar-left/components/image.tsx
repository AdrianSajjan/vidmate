import { useMutation } from "@tanstack/react-query";
import { PlusIcon, SearchIcon, XIcon } from "lucide-react";
import { flowResult } from "mobx";
import { observer } from "mobx-react";
import { Fragment, MouseEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { uploadAssetToS3 } from "@/api/upload";
import { mock, useMockStore } from "@/constants/mock";
import { useEditorContext } from "@/context/editor";
import { isImageLoaded } from "@/lib/utils";
import { formatSource } from "@/lib/media";

function _ImageSidebar() {
  const store = useMockStore();
  const editor = useEditorContext();

  const upload = useMutation({
    mutationFn: async (file: File) => uploadAssetToS3(file, "image"),
    onSuccess: (response) => mock.upload("image", response),
  });

  const handleUpload = (files: FileList | null) => {
    if (!files || !files.length) return;
    const promise = Promise.all(Array.from(files).map((file) => upload.mutateAsync(file)));
    toast.promise(promise, { loading: `The images are being uploaded`, success: `The images have been successfully uploaded`, error: `Ran into an error while uploading the images` });
  };

  const handleClick = (source: string, preload: boolean) => (event: MouseEvent<HTMLButtonElement>) => {
    const thumbnail = event.currentTarget.querySelector("img");
    if (editor.canvas.replacer.active?.type === "image") {
      const promise = flowResult(editor.canvas.replacer.replace(source, true));
      toast.promise(promise, { loading: "The image is being replaced...", success: "The image has been replaced", error: "Ran into an error while replacing the image" });
    } else if (!preload || !thumbnail || !isImageLoaded(thumbnail)) {
      const promise = flowResult(editor.canvas.onAddImageFromSource(source));
      toast.promise(promise, { loading: "The image is being loaded...", success: "The image has been added to artboard", error: "Ran into an error while adding the image" });
    } else {
      const promise = flowResult(editor.canvas.onAddImageFromThumbail(source, thumbnail));
      toast.promise(promise, { error: "Ran into an error while adding the image" });
    }
  };

  return (
    <div className="h-full w-full">
      <div className="flex items-center justify-between h-14 border-b px-4">
        <h2 className="font-semibold">Images</h2>
        <Button size="icon" variant="outline" className="bg-card h-7 w-7" onClick={() => editor.setActiveSidebarLeft(null)}>
          <XIcon size={16} />
        </Button>
      </div>
      <section className="sidebar-container pb-4">
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
                  <input hidden multiple type="file" accept="image/*" onChange={(event) => handleUpload(event.target.files)} />
                </label>
              </Button>
              <Button size="sm" variant="link" className="text-primary h-6 font-medium line-clamp-1 px-1.5">
                See All
              </Button>
            </div>
            <div className="flex gap-2.5 items-center overflow-x-scroll scrollbar-hidden relative">
              {store.images.length ? (
                store.images.map(({ source, thumbnail }) => (
                  <button key={source} onClick={handleClick(source, true)} className="group shrink-0 h-16 w-16 border flex items-center justify-center overflow-hidden rounded-md shadow-sm">
                    <img src={thumbnail} crossOrigin="anonymous" className="h-full w-full rounded-md transition-transform group-hover:scale-110 object-cover" />
                  </button>
                ))
              ) : (
                <Fragment>
                  {Array.from({ length: 3 }, (_, index) => (
                    <Skeleton key={index} className="h-16 flex-1 rounded-md" />
                  ))}
                  <span className="text-xs font-semibold text-foreground/60 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 leading-none">No Images</span>
                </Fragment>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <h4 className="text-xs font-semibold line-clamp-1">Images</h4>
              <Button size="sm" variant="link" className="text-primary font-medium line-clamp-1 px-1.5">
                See All
              </Button>
            </div>
            <div className="flex gap-2.5 items-center overflow-x-scroll scrollbar-hidden relative">
              <Fragment>
                {Array.from({ length: 3 }, (_, index) => (
                  <Skeleton key={index} className="h-16 flex-1 rounded-md" />
                ))}
                <span className="text-xs font-semibold text-foreground/60 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">Coming Soon</span>
              </Fragment>
            </div>
          </div>
          {editor.mode === "adapter" ? (
            <Fragment>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                  <h4 className="text-xs font-semibold line-clamp-1">Product Kit</h4>
                </div>
                <div className="flex gap-2.5 items-center overflow-x-scroll scrollbar-hidden relative">
                  {!editor.adapter.product || !editor.adapter.product.images.length ? (
                    <Fragment>
                      {Array.from({ length: 3 }, (_, index) => (
                        <Skeleton key={index} className="h-16 flex-1 rounded-md" />
                      ))}
                      <span className="text-xs font-semibold text-foreground/60 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">No product kit found</span>
                    </Fragment>
                  ) : (
                    editor.adapter.product.images.map((image) => (
                      <button key={image.id} onClick={handleClick(formatSource(image.url), false)} className="group shrink-0 h-16 w-16 border flex items-center justify-center overflow-hidden rounded-md shadow-sm">
                        <img src={formatSource(image.url)} crossOrigin="anonymous" className="h-full w-full rounded-md transition-transform group-hover:scale-110 object-cover" />
                      </button>
                    ))
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                  <h4 className="text-xs font-semibold line-clamp-1">Brand Kit</h4>
                </div>
                <div className="flex gap-2.5 items-center overflow-x-scroll scrollbar-hidden relative">
                  {!editor.adapter.brand ? (
                    <Fragment>
                      {Array.from({ length: 3 }, (_, index) => (
                        <Skeleton key={index} className="h-16 flex-1 rounded-md" />
                      ))}
                      <span className="text-xs font-semibold text-foreground/60 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">No brand kit found</span>
                    </Fragment>
                  ) : (
                    <button onClick={handleClick(formatSource(editor.adapter.brand.brand_logo), false)} className="group shrink-0 h-16 w-16 border flex items-center justify-center overflow-hidden rounded-md shadow-sm">
                      <img src={formatSource(editor.adapter.brand.brand_logo)} crossOrigin="anonymous" className="h-full w-full rounded-md transition-transform group-hover:scale-110 object-cover" />
                    </button>
                  )}
                </div>
              </div>
            </Fragment>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export const ImageSidebar = observer(_ImageSidebar);
