import { useMutation } from "@tanstack/react-query";
import { PlusIcon, SearchIcon, XIcon } from "lucide-react";
import { flowResult } from "mobx";
import { observer } from "mobx-react";
import { Fragment, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import { createAdsFromPrompt as createAdsFromPromptApi } from "@/api/prompt";
import { useEditorContext } from "@/context/editor";
import { PromptSession } from "@/types/prompt";

function _PromptSidebar() {
  const editor = useEditorContext();
  const [mode, setMode] = useState("edit");

  return (
    <Fragment>
      <div className="h-full w-full">
        <div className="flex items-center justify-between h-14 border-b px-4">
          <h2 className="font-semibold">Prompts</h2>
          <Button size="icon" variant="outline" className="bg-card h-7 w-7" onClick={() => (mode === "add" ? setMode("edit") : editor.setActiveSidebarLeft(null))}>
            <XIcon size={16} />
          </Button>
        </div>
        {!editor.prompter.hasSessions || mode === "add" ? <CreatePrompt /> : <PromptSessions onCreateSession={() => setMode("add")} />}
      </div>
    </Fragment>
  );
}

function _PromptSessions({ onCreateSession }: { onCreateSession: () => void }) {
  const editor = useEditorContext();

  const handleLoadPromptSession = async (session: PromptSession) => {
    const promise = flowResult(editor.prompter.createSceneFromPromptSession(session));
    toast.promise(promise, { loading: "Loading your session...", success: "Your session has been loaded", error: "Ran into an error while loading your session" });
  };

  return (
    <section className="sidebar-container py-4 px-3.5">
      <div className="relative">
        <Input placeholder="Search..." className="text-xs pl-8" />
        <SearchIcon size={15} className="absolute top-1/2 -translate-y-1/2 left-2.5 text-foreground/60" />
      </div>
      <div className="my-3.5">
        <Button size="sm" className="gap-1 pl-2 w-full" onClick={onCreateSession}>
          <PlusIcon size={15} />
          <span>Create Prompt</span>
        </Button>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <h4 className="text-xs font-semibold line-clamp-1">Sessions</h4>
          <Button size="sm" variant="link" className="text-primary font-medium line-clamp-1 px-1.5">
            See All
          </Button>
        </div>
        <div className="flex flex-col">
          {Array.from(editor.prompter.sessions.values()).map((session) => (
            <Button size="sm" variant="outline" className="w-full h-auto py-2.5 px-4 gap-0.5 flex flex-col items-start" key={session.id} onClick={() => handleLoadPromptSession(session)}>
              <span className="line-clamp-1">
                <span className="font-semibold">Prompt: </span>
                <span>{session.prompt}</span>
              </span>
              <span className="line-clamp-1">
                <span className="font-semibold">Duration: </span>
                <span>{session.duration}s</span>
              </span>
              <span className="line-clamp-1">
                <span className="font-semibold">Format: </span>
                <span className="capitalize">{session.format}</span>
              </span>
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}

function _CreatePrompt() {
  const editor = useEditorContext();

  const [format, setFormat] = useState("banner");
  const [prompt, setPrompt] = useState("Generate an ad for Nike Running Shoes");

  const createAdsFromPrompt = useMutation({
    mutationFn: async ({ prompt, format }: { prompt: string; format: string }) => {
      const result = await createAdsFromPromptApi(prompt, format);
      await flowResult(editor.prompter.createSceneFromPromptSession(result));
    },
  });

  const handleCreateVideo = () => {
    const promise = createAdsFromPrompt.mutateAsync({ prompt, format });
    toast.promise(promise, { loading: "Generating your video ads...", success: "Your video ads is generated", error: "Ran into an error while generating your ads" });
  };

  return (
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
      <Button size="sm" className="w-full mt-6" onClick={handleCreateVideo} disabled>
        Coming Soon
      </Button>
    </section>
  );
}

const CreatePrompt = observer(_CreatePrompt);
const PromptSessions = observer(_PromptSessions);
export const PromptSidebar = observer(_PromptSidebar);
