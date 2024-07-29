import { XIcon } from "lucide-react";
import { observer } from "mobx-react";
import { Fragment } from "react/jsx-runtime";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEditorContext } from "@/context/editor";

function _PromptSidebar() {
  const editor = useEditorContext();

  return (
    <Fragment>
      <div className="h-full w-full">
        <div className="flex items-center justify-between h-14 border-b px-4">
          <h2 className="font-semibold">Prompts</h2>
          <Button size="icon" variant="outline" className="bg-card h-7 w-7" onClick={() => editor.setActiveSidebarLeft(null)}>
            <XIcon size={16} />
          </Button>
        </div>
        <section className="sidebar-container py-4 px-3.5">
          <div className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-foreground/75">Which format do you want?</Label>
              <Tabs defaultValue="feed">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="feed" className="h-full gap-1.5">
                    <span className="text-xs">Feed</span>
                  </TabsTrigger>
                  <TabsTrigger value="story" className="h-full gap-1.5">
                    <span className="text-xs">Story</span>
                  </TabsTrigger>
                  <TabsTrigger value="banner" className="h-full gap-1.5">
                    <span className="text-xs">Banner</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-foreground/75">Provide topic with detailed instructions</Label>
              <Textarea className="text-xs min-h-20 h-24 max-h-40" />
            </div>
          </div>
          <Button size="sm" className="w-full mt-6">
            Generate Video
          </Button>
        </section>
      </div>
    </Fragment>
  );
}

export const PromptSidebar = observer(_PromptSidebar);
