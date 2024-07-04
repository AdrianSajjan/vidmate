import { observer } from "mobx-react";
import { Fragment, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Grid2X2Icon, ImageIcon, LayersIcon, MusicIcon, ScalingIcon, TypeIcon, UploadIcon, VideoIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEditorContext } from "@/context/editor";
import { leftSidebarWidth } from "@/constants/layout";

import { TemplateSidebar } from "./components/template";
import { TextSidebar } from "./components/text";
import { ElementSidebar } from "./components/element";
import { ImageSidebar } from "./components/image";
import { VideoSidebar } from "./components/video";
import { AudioSidebar } from "./components/audio";
import { UploadSidebar } from "./components/upload";
import { FormatSidebar } from "./components/format";

const sidebarComponentMap: Record<string, () => JSX.Element> = {
  templates: TemplateSidebar,
  texts: TextSidebar,
  uploads: UploadSidebar,
  images: ImageSidebar,
  videos: VideoSidebar,
  audios: AudioSidebar,
  elements: ElementSidebar,
  formats: FormatSidebar,
};

function _EditorSidebarLeft() {
  const editor = useEditorContext();

  const items = useMemo(() => {
    return [
      {
        icon: Grid2X2Icon,
        label: "Templates",
        value: "templates",
      },
      {
        icon: LayersIcon,
        label: "Elements",
        value: "elements",
      },
      {
        icon: TypeIcon,
        label: "Texts",
        value: "texts",
      },
      {
        icon: ImageIcon,
        label: "Images",
        value: "images",
      },
      {
        icon: VideoIcon,
        label: "Videos",
        value: "videos",
      },
      {
        icon: MusicIcon,
        label: "Audios",
        value: "audios",
      },
      {
        icon: UploadIcon,
        label: "Uploads",
        value: "uploads",
      },
      {
        icon: ScalingIcon,
        label: "Formats",
        value: "formats",
      },
    ];
  }, []);

  const Sidebar = editor.sidebarLeft ? sidebarComponentMap[editor.sidebarLeft] : null;

  return (
    <Fragment>
      <aside className="w-20 bg-card/75 dark:bg-gray-900/30 flex flex-col items-center py-2 border-r gap-2 shrink-0">
        {items.map(({ icon: Icon, label, value }) => {
          return (
            <Button
              size="icon"
              key={value}
              variant="ghost"
              aria-label={value}
              className={cn("w-16 h-16 flex flex-col gap-2", editor.sidebarLeft === value && "bg-card shadow-sm border hover:bg-card")}
              onClick={() => editor.setActiveSidebarLeft(editor.sidebarLeft === value ? null : value)}
            >
              <Icon size={20} strokeWidth={1.5} />
              <span className="text-xxs leading-none">{label}</span>
            </Button>
          );
        })}
      </aside>
      <AnimatePresence>
        {Sidebar ? (
          <motion.aside initial={{ width: 0 }} animate={{ width: leftSidebarWidth }} exit={{ width: 0 }} className="overflow-hidden bg-card/60 border-r shrink-0">
            <Sidebar key={editor.sidebarLeft} />
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </Fragment>
  );
}

export const EditorSidebarLeft = observer(_EditorSidebarLeft);
