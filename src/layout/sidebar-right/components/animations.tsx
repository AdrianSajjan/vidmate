import { XIcon } from "lucide-react";
import { observer } from "mobx-react";
import { ChangeEventHandler, HTMLAttributes } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { cn } from "@/lib/utils";
import { EditorAnimation, easings, entry, exit, scene } from "@/constants/animations";
import { useEditorContext } from "@/context/editor";
import { usePreviewAnimation } from "@/hooks/use-preview-animation";

function _AnimationSidebar() {
  const editor = useEditorContext();

  return (
    <div className="h-full w-full @container">
      <div className="flex items-center h-14 border-b px-4 gap-2.5">
        <h2 className="font-semibold">Animations</h2>
        <Button size="icon" variant="outline" className="bg-card h-7 w-7 ml-auto" onClick={() => editor.setActiveSidebarRight(null)}>
          <XIcon size={15} />
        </Button>
      </div>
      <section className="sidebar-container px-4 py-4">
        <Tabs defaultValue="in">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="in" className="text-xs h-full">
              In
            </TabsTrigger>
            <TabsTrigger value="out" className="text-xs h-full">
              Out
            </TabsTrigger>
            <TabsTrigger value="scene" className="text-xs h-full">
              Scene
            </TabsTrigger>
          </TabsList>
          <TabsContent value="in" className="mt-0 pt-5">
            <EntryAnimations />
          </TabsContent>
          <TabsContent value="out" className="mt-0 pt-5">
            <ExitAnimations />
          </TabsContent>
          <TabsContent value="scene" className="mt-0 pt-5">
            <SceneAnimations />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

function _EntryAnimations() {
  const editor = useEditorContext();

  const selected = editor.canvas.selection.active!;
  const disabled = !selected.anim?.in.name || selected.anim?.in.name === "none";

  const easing = selected.anim?.in.easing || "linear";
  const duration = (selected.anim?.in.duration || 0) / 1000;

  usePreviewAnimation(selected, "in");

  const handleSelectAnimation = (animation: EditorAnimation) => {
    editor.canvas.onChangeActiveObjectAnimation("in", animation.value);
    if (animation.value !== "none") {
      const duration = animation.fixed?.duration ? animation.duration : selected.anim?.out.duration;
      const easing = animation.fixed?.easing ? animation.easing : selected.anim?.out.easing;
      editor.canvas.onChangeActiveObjectAnimationDuration("in", duration || 500);
      editor.canvas.onChangeActiveObjectAnimationEasing("in", easing || "linear");
    }
  };

  const handleChangeEasing = (easing: string) => {
    editor.canvas.onChangeActiveObjectAnimationEasing("in", easing);
  };

  const handleChangeDuration: ChangeEventHandler<HTMLInputElement> = (event) => {
    const value = +event.target.value * 1000;
    if (isNaN(value) || value < 0) return;
    editor.canvas.onChangeActiveObjectAnimationDuration("in", value);
  };

  return (
    <div className="flex flex-col px-1">
      <div className="flex items-center justify-between gap-6">
        <Label className={cn("text-xs shrink-0", disabled ? "opacity-50" : "opacity-100")}>Duration (s)</Label>
        <Input value={duration} onChange={handleChangeDuration} disabled={disabled} type="number" step={0.1} className="text-xs h-8 w-40" />
      </div>
      <div className="flex items-center justify-between gap-6 mt-3">
        <Label className={cn("text-xs shrink-0", disabled ? "opacity-50" : "opacity-100")}>Easing</Label>
        <Select value={easing} onValueChange={handleChangeEasing} disabled={disabled}>
          <SelectTrigger className="h-8 text-xs w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {easings.map((easing) => (
              <SelectItem key={easing.value} className="text-xs" value={easing.value}>
                {easing.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 @sm:grid-cols-3 @md:grid-cols-4 gap-5 pt-6">
        {entry
          .filter((animation) => !animation.type || animation.type === selected.type)
          .map((animation) => (
            <AnimationItem key={animation.label} animation={animation} selected={selected.anim?.in.name === animation.value} onClick={() => handleSelectAnimation(animation)} />
          ))}
      </div>
    </div>
  );
}

function _ExitAnimations() {
  const editor = useEditorContext();

  const selected = editor.canvas.selection.active!;
  const disabled = !selected.anim?.out.name || selected.anim?.out.name === "none";

  const easing = selected.anim?.out.easing || "linear";
  const duration = (selected.anim?.out.duration || 0) / 1000;

  usePreviewAnimation(selected, "out");

  const handleSelectAnimation = (animation: EditorAnimation) => {
    editor.canvas.onChangeActiveObjectAnimation("out", animation.value);
    if (animation.value !== "none") {
      const duration = animation.fixed?.duration ? animation.duration : selected.anim?.out.duration;
      const easing = animation.fixed?.easing ? animation.easing : selected.anim?.out.easing;
      editor.canvas.onChangeActiveObjectAnimationDuration("out", duration || 500);
      editor.canvas.onChangeActiveObjectAnimationEasing("out", easing || "linear");
    }
  };

  const handleChangeEasing = (easing: string) => {
    editor.canvas.onChangeActiveObjectAnimationEasing("out", easing);
  };

  const handleChangeDuration: ChangeEventHandler<HTMLInputElement> = (event) => {
    const value = +event.target.value * 1000;
    if (isNaN(value) || value < 0) return;
    editor.canvas.onChangeActiveObjectAnimationDuration("out", value);
  };

  return (
    <div className="flex flex-col px-1">
      <div className="flex items-center justify-between gap-6">
        <Label className={cn("text-xs shrink-0", disabled ? "opacity-50" : "opacity-100")}>Duration (s)</Label>
        <Input value={duration} onChange={handleChangeDuration} disabled={disabled} type="number" step={0.1} className="text-xs h-8 w-40" />
      </div>
      <div className="flex items-center justify-between gap-6 mt-3">
        <Label className={cn("text-xs shrink-0", disabled ? "opacity-50" : "opacity-100")}>Easing</Label>
        <Select value={easing} onValueChange={handleChangeEasing} disabled={disabled}>
          <SelectTrigger className="h-8 text-xs w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {easings.map((easing) => (
              <SelectItem key={easing.value} className="text-xs" value={easing.value}>
                {easing.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 @sm:grid-cols-3 @md:grid-cols-4 gap-5 pt-6">
        {exit
          .filter((animation) => !animation.type || animation.type === selected.type)
          .map((animation) => (
            <AnimationItem key={animation.label} animation={animation} selected={selected.anim?.out.name === animation.value} onClick={() => handleSelectAnimation(animation)} />
          ))}
      </div>
    </div>
  );
}

function _SceneAnimations() {
  const editor = useEditorContext();
  const selected = editor.canvas.selection.active!;

  const animation = scene.find((animation) => animation.value === selected.anim?.scene.name);
  const disabled = !selected.anim?.scene.name || selected.anim?.scene.name === "none";

  const easing = selected.anim?.scene.easing || "linear";
  const duration = (selected.anim?.scene.duration || 0) / 1000;

  usePreviewAnimation(selected, "scene");

  const handleSelectAnimation = (animation: EditorAnimation) => {
    editor.canvas.onChangeActiveObjectAnimation("scene", animation.value);
    if (animation.value !== "none") {
      const duration = animation.fixed?.duration ? animation.duration : selected.anim?.scene.duration;
      const easing = animation.fixed?.easing ? animation.easing : selected.anim?.scene.easing;
      editor.canvas.onChangeActiveObjectAnimationDuration("scene", duration || 500);
      editor.canvas.onChangeActiveObjectAnimationEasing("scene", easing || "linear");
    }
  };

  const handleChangeEasing = (easing: string) => {
    editor.canvas.onChangeActiveObjectAnimationEasing("scene", easing);
  };

  const handleChangeDuration: ChangeEventHandler<HTMLInputElement> = (event) => {
    const value = +event.target.value * 1000;
    if (isNaN(value) || value < 0) return;
    editor.canvas.onChangeActiveObjectAnimationDuration("scene", value);
  };

  return (
    <div className="flex flex-col px-1">
      <div className="flex items-center justify-between gap-6">
        <Label className={cn("text-xs shrink-0", disabled ? "opacity-50" : "opacity-100")}>Duration (s)</Label>
        <Input value={duration} onChange={handleChangeDuration} disabled={disabled || animation?.disabled?.duration} type="number" step={0.1} className="text-xs h-8 w-40" />
      </div>
      <div className="flex items-center justify-between gap-6 mt-3">
        <Label className={cn("text-xs shrink-0", disabled ? "opacity-50" : "opacity-100")}>Easing</Label>
        <Select value={easing} onValueChange={handleChangeEasing} disabled={disabled || animation?.disabled?.easing}>
          <SelectTrigger className="h-8 text-xs w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {easings.map((easing) => (
              <SelectItem key={easing.value} className="text-xs" value={easing.value}>
                {easing.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 @sm:grid-cols-3 @md:grid-cols-4 gap-5 pt-6">
        {scene
          .filter((animation) => !animation.type || animation.type === selected.type)
          .map((animation) => (
            <AnimationItem key={animation.label} animation={animation} selected={selected.anim?.scene.name === animation.value} onClick={() => handleSelectAnimation(animation)} />
          ))}
      </div>
    </div>
  );
}

interface AnimationItemProps extends HTMLAttributes<HTMLButtonElement> {
  animation: EditorAnimation;
  selected?: boolean;
}

function _AnimationItem({ animation, selected, className, ...props }: AnimationItemProps) {
  return (
    <div className="space-y-0.5">
      <button className={cn("w-full aspect-square rounded-xl overflow-hidden border", selected ? "ring-2 ring-primary/50" : "ring-0", className)} {...props}>
        <img src={animation.preview} className="h-full w-full" />
      </button>
      <p className="text-xs font-medium text-center text-foreground/60">{animation.label}</p>
    </div>
  );
}

const AnimationItem = observer(_AnimationItem);
const ExitAnimations = observer(_ExitAnimations);
const EntryAnimations = observer(_EntryAnimations);
const SceneAnimations = observer(_SceneAnimations);
export const AnimationSidebar = observer(_AnimationSidebar);
