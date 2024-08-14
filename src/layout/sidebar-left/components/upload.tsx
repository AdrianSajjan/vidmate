import { flowResult } from "mobx";
import { observer } from "mobx-react";
import { PauseIcon, PlayIcon, PlusIcon, SearchIcon, XIcon } from "lucide-react";
import { Fragment, MouseEventHandler, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { useEditorContext } from "@/context/editor";
import { isImageLoaded } from "@/lib/utils";
import { mock, useMockStore } from "@/constants/mock";
import { EditorAudio } from "@/types/editor";
import { formatMediaDuration } from "@/lib/time";
import { uploadAssetToS3 } from "@/api/upload";
import { extractAudioWaveformFromAudioFile, extractThumbnailFromImageURL, extractThumbnailFromVideoURL } from "@/lib/media";

interface UploadResponse {
  source: string;
  thumbnail: string;
  duration?: number;
  name?: string;
}

function _UploadSidebar() {
  const store = useMockStore();
  const editor = useEditorContext();

  const upload = useMutation({
    mutationFn: async ({ file, type }: { type: "image" | "video" | "audio"; file: File }): Promise<UploadResponse> => {
      const source = await uploadAssetToS3(file, type);
      switch (type) {
        case "image": {
          const thumbnail = await extractThumbnailFromImageURL(source);
          return { source, thumbnail };
        }
        case "video": {
          const thumbnail = await extractThumbnailFromVideoURL(source);
          return { source, thumbnail };
        }
        case "audio": {
          const waveform = await extractAudioWaveformFromAudioFile(file);
          return { source, name: file.name, ...waveform };
        }
      }
    },
    onSuccess: (response, params) => {
      switch (params.type) {
        case "image":
          mock.upload("image", response);
          break;
        case "video":
          mock.upload("video", response);
          break;
        case "audio":
          mock.upload("audio", response as Required<UploadResponse>);
          break;
      }
    },
  });

  const handleUpload = (files: FileList | null, type: "image" | "video" | "audio") => {
    if (!files || !files.length) return;
    const promise = Promise.all(Array.from(files).map((file) => upload.mutateAsync({ file, type })));
    toast.promise(promise, { loading: `The assets are being uploaded`, success: `The assets have been successfully uploaded`, error: `Ran into an error while uploading the assets` });
  };

  const handleClickImage =
    (source: string): MouseEventHandler<HTMLButtonElement> =>
    (event) => {
      const thumbnail = event.currentTarget.querySelector("img");
      if (!thumbnail || !isImageLoaded(thumbnail)) {
        const promise = flowResult(editor.canvas.onAddImageFromSource(source));
        toast.promise(promise, { loading: "The image asset is being loaded...", success: "The image asset has been added to artboard", error: "Ran into an error adding the image asset" });
      } else {
        const promise = flowResult(editor.canvas.onAddImageFromThumbail(source, thumbnail));
        toast.promise(promise, { error: "Ran into an error adding the image asset" });
      }
    };

  const handleClickVideo =
    (source: string): MouseEventHandler<HTMLButtonElement> =>
    async (event) => {
      const thumbnail = event.currentTarget.querySelector("img");
      if (!thumbnail || !isImageLoaded(thumbnail)) {
        const promise = flowResult(editor.canvas.onAddVideoFromSource(source));
        toast.promise(promise, { loading: "The video asset is being loaded...", success: "The video asset has been added to artboard", error: "Ran into an error adding the video asset" });
      } else {
        const promise = flowResult(editor.canvas.onAddVideoFromThumbail(source, thumbnail));
        toast.promise(promise, { error: "Ran into an error adding the video asset" });
      }
    };

  const handleClickAudio = (audio: EditorAudio) => async () => {
    const promise = flowResult(editor.canvas.audio.add(audio.source, audio.name));
    toast.promise(promise, { loading: "The audio asset is being loaded...", success: "The audio asset has been added to timeline", error: "Ran into an error adding the audio asset" });
  };

  return (
    <div className="h-full w-full">
      <div className="flex items-center justify-between h-14 border-b px-4">
        <h2 className="font-semibold">Uploads</h2>
        <Button size="icon" variant="outline" className="bg-card h-7 w-7" onClick={() => editor.setActiveSidebarLeft(null)}>
          <XIcon size={16} />
        </Button>
      </div>
      <section className="sidebar-container pb-4">
        <div className="px-3 pt-4">
          <div className="relative">
            <Input placeholder="Search..." className="text-xs pl-8" />
            <SearchIcon size={15} className="absolute top-1/2 -translate-y-1/2 left-2.5 text-foreground/60" />
          </div>
        </div>
        <div className="px-3 flex flex-col divide-y">
          <div className="flex flex-col gap-4 py-6">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-semibold line-clamp-1">Images</h4>
              <Button asChild size="sm" variant="outline" className="h-7 ml-auto bg-card gap-1 pl-2">
                <label>
                  <PlusIcon size={14} />
                  <span>Add File</span>
                  <input hidden multiple type="file" accept="image/*" onChange={(event) => handleUpload(event.target.files, "image")} />
                </label>
              </Button>
              <Button size="sm" variant="link" className="text-primary h-6 font-medium line-clamp-1 px-1.5">
                See All
              </Button>
            </div>
            <div className="flex gap-2.5 items-center overflow-x-scroll scrollbar-hidden relative">
              {store.images.length ? (
                store.images.map(({ source, thumbnail }) => (
                  <button key={source} onClick={handleClickImage(source)} className="group shrink-0 h-16 w-16 border flex items-center justify-center overflow-hidden rounded-md shadow-sm">
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
          <div className="flex flex-col gap-4 py-6">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-semibold line-clamp-1">Videos</h4>
              <Button asChild size="sm" variant="outline" className="h-7 ml-auto bg-card gap-1 pl-2">
                <label>
                  <PlusIcon size={14} />
                  <span>Add File</span>
                  <input hidden multiple type="file" accept="video/*" onChange={(event) => handleUpload(event.target.files, "video")} />
                </label>
              </Button>
              <Button size="sm" variant="link" className="text-primary h-6 font-medium line-clamp-1 px-1.5">
                See All
              </Button>
            </div>
            <div className="flex gap-2.5 items-center overflow-x-scroll scrollbar-hidden relative">
              {store.videos.length ? (
                store.videos.map(({ source, thumbnail }) => (
                  <button key={source} onClick={handleClickVideo(source)} className="group shrink-0 h-16 w-16 border flex items-center justify-center overflow-hidden rounded-md shadow-sm">
                    <img src={thumbnail} crossOrigin="anonymous" className="h-full w-full rounded-md transition-transform group-hover:scale-110 object-cover" />
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
          <div className="flex flex-col gap-4 py-6">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-semibold line-clamp-1">Audios</h4>
              <Button asChild size="sm" variant="outline" className="h-7 ml-auto bg-card gap-1 pl-2">
                <label>
                  <PlusIcon size={14} />
                  <span>Add File</span>
                  <input hidden multiple type="file" accept="audio/*" onChange={(event) => handleUpload(event.target.files, "audio")} />
                </label>
              </Button>
              <Button size="sm" variant="link" className="text-primary h-6 font-medium line-clamp-1 px-1.5">
                See All
              </Button>
            </div>
            <div className="flex gap-2.5 items-center overflow-x-scroll scrollbar-hidden relative">
              {store.audios.length ? (
                store.audios.map((audio) => <AudioItem key={audio.source} audio={audio} onClick={handleClickAudio(audio)} />)
              ) : (
                <Fragment>
                  {Array.from({ length: 3 }, (_, index) => (
                    <Skeleton key={index} className="h-16 flex-1 rounded-md" />
                  ))}
                  <span className="text-xs font-semibold text-foreground/60 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 leading-none">No Audios</span>
                </Fragment>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function AudioItem({ audio, onClick }: { audio: EditorAudio; onClick?: () => void }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [isPlaying, setPlaying] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const current = ref.current;
    const handler = () => setPlaying(false);
    current.addEventListener("ended", handler);
    return () => {
      current.removeEventListener("ended", handler);
    };
  }, [ref]);

  const handlePlay: MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
    if (isPlaying) {
      setPlaying(false);
      ref.current?.pause();
    } else {
      setPlaying(true);
      ref.current?.play();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button onClick={onClick} className="group shrink-0 h-16 w-20 border overflow-hidden rounded-md shadow-sm relative">
        <img src={audio.thumbnail} crossOrigin="anonymous" className="h-8 w-full rounded-md transition-transform group-hover:scale-110 object-cover" />
        <div className="absolute hidden group-hover:inline-flex items-center justify-between gap-2 bottom-1 left-1 right-1 text-card bg-foreground/50 pr-1.5 rounded-sm">
          <div role="button" className="px-1.5 py-1 transition-transform hover:scale-125" onClick={handlePlay}>
            {isPlaying ? <PauseIcon size={14} className="fill-card" /> : <PlayIcon size={14} className="fill-card" />}
          </div>
          <span className="text-xxs font-medium">{formatMediaDuration(audio.duration * 1000, false)}</span>
          <audio ref={ref}>
            <source src={audio.source} />
          </audio>
        </div>
      </button>
      <div className="text-xxs font-medium w-20 px-1 mx-auto whitespace-nowrap overflow-hidden text-ellipsis">{audio.name}</div>
    </div>
  );
}

export const UploadSidebar = observer(_UploadSidebar);
