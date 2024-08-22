import { observer } from "mobx-react";
import { Fragment, useMemo } from "react";
import { Grid2X2Icon, ImageIcon, LayersIcon, MusicIcon, ScalingIcon, TypeIcon, UploadIcon, VideoIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";

import { useIsTablet } from "@/hooks/use-media-query";
import { useEditorContext } from "@/context/editor";

import { leftSidebarWidth } from "@/constants/layout";
import { cn } from "@/lib/utils";

import { AudioSidebar } from "./components/audio";
import { ElementSidebar } from "./components/element";
import { FormatSidebar } from "./components/format";
import { ImageSidebar } from "./components/image";
import { TemplateSidebar } from "./components/template";
import { TextSidebar } from "./components/text";
import { UploadSidebar } from "./components/upload";
import { VideoSidebar } from "./components/video";
import { ChartSidebar } from "./components/chart";
import { PromptSidebar } from "./components/prompt";

const sidebarComponentMap: Record<string, () => JSX.Element> = {
  templates: TemplateSidebar,
  texts: TextSidebar,
  uploads: UploadSidebar,
  images: ImageSidebar,
  videos: VideoSidebar,
  audios: AudioSidebar,
  charts: ChartSidebar,
  elements: ElementSidebar,
  formats: FormatSidebar,
  prompt: PromptSidebar,
};

function _EditorSidebarLeft() {
  const editor = useEditorContext();
  const isTablet = useIsTablet();

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
      // {
      //   icon: LineChartIcon,
      //   label: "Charts",
      //   value: "charts",
      // },
      // {
      //   icon: TerminalSquareIcon,
      //   label: "Prompt",
      //   value: "prompt",
      // },
    ];
  }, []);

  const Sidebar = editor.sidebarLeft ? sidebarComponentMap[editor.sidebarLeft] : null;

  if (!isTablet)
    return (
      <Fragment>
        <aside className="h-16 absolute bottom-0 left-0 bg-card dark:bg-gray-900/40 border-t border-t-border/25 flex items-center z-10 gap-2.5 w-screen overflow-x-scroll scrollbar-hidden px-1.5">
          {items.map(({ icon: Icon, label, value }) => {
            return (
              <Button
                size="icon"
                key={value}
                variant="ghost"
                aria-label={value}
                className={cn("min-w-16 h-14 flex flex-col gap-2 hover:bg-transparent hover:text-primary", editor.sidebarLeft === value ? "text-primary" : "text-foreground")}
                onClick={() => editor.setActiveSidebarLeft(editor.sidebarLeft === value ? null : value)}
              >
                <Icon size={20} strokeWidth={1.5} />
                <span className="text-xxs leading-none">{label}</span>
              </Button>
            );
          })}
        </aside>
        <Drawer open={!!Sidebar} onClose={() => editor.setActiveSidebarLeft(null)}>
          <DrawerContent>
            <DialogTitle className="sr-only"></DialogTitle>
            <DialogDescription className="sr-only"></DialogDescription>
            {Sidebar ? <Sidebar /> : null}
          </DrawerContent>
        </Drawer>
      </Fragment>
    );

  return (
    <Fragment>
      <aside className="w-20 bg-card/75 dark:bg-gray-900/30 flex flex-col items-center py-2 border-r border-r-border/50 gap-2 shrink-0">
        {items.map(({ icon: Icon, label, value }) => {
          return (
            <Button
              size="icon"
              key={value}
              variant="ghost"
              aria-label={value}
              className={cn("w-16 h-16 flex flex-col gap-2", editor.sidebarLeft === value ? "bg-card shadow-sm border hover:bg-card" : "bg-transparent hover:bg-accent")}
              onClick={() => editor.setActiveSidebarLeft(editor.sidebarLeft === value ? null : value)}
            >
              <Icon size={20} strokeWidth={1.5} />
              <span className="text-xxs leading-none">{label}</span>
            </Button>
          );
        })}
      </aside>
      {Sidebar ? (
        <aside style={{ width: leftSidebarWidth }} className="overflow-hidden bg-card/60 border-r shrink-0">
          <Sidebar key={editor.sidebarLeft} />
        </aside>
      ) : null}
    </Fragment>
  );
}

export const EditorSidebarLeft = observer(_EditorSidebarLeft);
