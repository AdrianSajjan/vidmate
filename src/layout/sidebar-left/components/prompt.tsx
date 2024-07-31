import { XIcon } from "lucide-react";
import { observer } from "mobx-react";
import { useMutation } from "@tanstack/react-query";
import { useState, Fragment } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useEditorContext } from "@/context/editor";
import { createAdsFromPrompt as createAdsFromPromptApi } from "@/api/prompt";

function _PromptSidebar() {
  const editor = useEditorContext();

  const [format, setFormat] = useState("banner");
  const [prompt, setPrompt] = useState("Running Shoes");

  const createAdsFromPrompt = useMutation({
    mutationFn: async ({ prompt, format }: { prompt: string; format: string }) => {
      const result = await createAdsFromPromptApi(prompt, format);
    },
  });

  const handleCreateVideo = () => {
    const promise = createAdsFromPrompt.mutateAsync({ prompt, format });
    toast.promise(promise, { loading: "Generating your video ad...", success: "Your video ad is generated", error: "Ran into an error while generating your ad" });
  };

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
              <Tabs value={format} onValueChange={setFormat}>
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="feed" className="h-full gap-1.5" disabled>
                    <span className="text-xs">Feed</span>
                  </TabsTrigger>
                  <TabsTrigger value="story" className="h-full gap-1.5" disabled>
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
              <Textarea className="text-xs min-h-20 h-24 max-h-40" readOnly value={prompt} onChange={(event) => setPrompt(event.target.value)} />
            </div>
          </div>
          <Button size="sm" className="w-full mt-6" onClick={handleCreateVideo}>
            Generate Video
          </Button>
        </section>
      </div>
    </Fragment>
  );
}

export const PromptSidebar = observer(_PromptSidebar);
