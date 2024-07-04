import { XIcon } from "lucide-react";
import { observer } from "mobx-react";
import { ChangeEventHandler, HTMLAttributes, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { rightSidebarWidth } from "@/constants/layout";
import { useEditorContext } from "@/context/editor";
import { EditorAnimation, easings, entry, exit } from "@/fabric/animations";
import { cn } from "@/lib/utils";

function _AnimationSidebar() {
  const editor = useEditorContext();
  const selected = editor.canvas.selected as fabric.Image | null;

  useEffect(() => {
    if (!selected) editor.setActiveSidebarRight(null);
  }, [selected, editor]);

  return (
    <div className="h-full" style={{ width: rightSidebarWidth }}>
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
            <TabsTrigger value="animate" className="text-xs h-full" disabled>
              Animate
            </TabsTrigger>
          </TabsList>
          <TabsContent value="in" className="mt-0 pt-5">
            <EntryAnimations />
          </TabsContent>
          <TabsContent value="out" className="mt-0 pt-5">
            <ExitAnimations />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

function _EntryAnimations() {
  const editor = useEditorContext();

  const selected = editor.canvas.selected as fabric.Image | null;
  const animation = entry.find((animation) => animation.value === selected?.anim?.in.name);

  const easing = selected?.anim?.in.easing || "linear";
  const duration = animation?.fixed?.duration ? 0 : (selected?.anim?.in.duration || 0) / 1000;
  const disabled = !selected?.anim?.in.name || selected?.anim?.in.name === "none";

  const handleSelectAnimation = (animation: EditorAnimation) => {
    editor.canvas.onChangActiveObjectAnimation("in", animation.value);
    if (animation.value === "none") return;
    const duration = animation?.fixed?.duration ? animation.duration : selected?.anim?.out.duration;
    const easing = animation?.fixed?.easing ? animation.easing : selected?.anim?.out.easing;
    editor.canvas.onChangActiveObjectAnimationDuration("in", duration || 500);
    editor.canvas.onChangActiveObjectAnimationEasing("in", easing || "linear");
  };

  const handleChangeEasing = (easing: string) => {
    editor.canvas.onChangActiveObjectAnimationEasing("in", easing);
  };

  const handleChangeDuration: ChangeEventHandler<HTMLInputElement> = (event) => {
    const value = +event.target.value * 1000;
    if (isNaN(value) || value < 0) return;
    editor.canvas.onChangActiveObjectAnimationDuration("in", value);
  };

  return (
    <div className="flex flex-col px-1">
      <div className="flex items-center justify-between gap-6">
        <Label className={cn("text-xs shrink-0", disabled ? "opacity-50" : "opacity-100")}>Duration (s)</Label>
        <Input value={duration} onChange={handleChangeDuration} disabled={disabled || animation?.fixed?.duration} type="number" step={0.25} className="text-xs h-8 w-40" />
      </div>
      <div className="flex items-center justify-between gap-6 mt-3">
        <Label className={cn("text-xs shrink-0", disabled ? "opacity-50" : "opacity-100")}>Easing</Label>
        <Select value={easing} onValueChange={handleChangeEasing} disabled={disabled || animation?.fixed?.easing}>
          <SelectTrigger className="h-8 text-xs w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="item-aligned">
            {easings.map((easing) => (
              <SelectItem key={easing.value} className="text-xs" value={easing.value}>
                {easing.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-5 pt-6">
        {entry.map((animation) => (
          <AnimationItem key={animation.label} animation={animation} className={selected?.anim?.in.name === animation.value ? "ring-2 ring-blue-600/50" : "ring-0"} onClick={() => handleSelectAnimation(animation)} />
        ))}
      </div>
    </div>
  );
}

function _ExitAnimations() {
  const editor = useEditorContext();

  const selected = editor.canvas.selected as fabric.Image | null;
  const disabled = !selected?.anim?.out.name || selected?.anim?.out.name === "none";

  const handleSelectAnimation = (animation: EditorAnimation) => {
    editor.canvas.onChangActiveObjectAnimation("out", animation.value);
    if (animation.value === "none") return;
    editor.canvas.onChangActiveObjectAnimationDuration("out", animation.duration || selected?.anim?.out.duration || 500);
    editor.canvas.onChangActiveObjectAnimationEasing("out", animation.easing || selected?.anim?.out.easing || "linear");
  };

  const handleChangeEasing = (easing: string) => {
    editor.canvas.onChangActiveObjectAnimationEasing("out", easing);
  };

  const handleChangeDuration: ChangeEventHandler<HTMLInputElement> = (event) => {
    const value = +event.target.value * 1000;
    if (isNaN(value) || value < 0) return;
    editor.canvas.onChangActiveObjectAnimationDuration("out", value);
  };

  return (
    <div className="flex flex-col px-1">
      <div className="flex items-center justify-between gap-6">
        <Label className={cn("text-xs shrink-0", disabled ? "opacity-50" : "opacity-100")}>Duration (s)</Label>
        <Input value={(selected?.anim?.out.duration || 0) / 1000} onChange={handleChangeDuration} disabled={disabled} type="number" step={0.25} className="text-xs h-8 w-40" />
      </div>
      <div className="flex items-center justify-between gap-6 mt-3">
        <Label className={cn("text-xs shrink-0", disabled ? "opacity-50" : "opacity-100")}>Easing</Label>
        <Select value={selected?.anim?.out.easing || "linear"} onValueChange={handleChangeEasing} disabled={disabled}>
          <SelectTrigger className="h-8 text-xs w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="item-aligned">
            {easings.map((easing) => (
              <SelectItem key={easing.value} className="text-xs" value={easing.value}>
                {easing.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-5 pt-6">
        {exit.map((animation) => (
          <AnimationItem key={animation.label} animation={animation} className={selected?.anim?.out.name === animation.value ? "ring-2 ring-blue-600/50" : "ring-0"} onClick={() => handleSelectAnimation(animation)} />
        ))}
      </div>
    </div>
  );
}

interface AniamtionItemProps extends HTMLAttributes<HTMLButtonElement> {
  animation: EditorAnimation;
}

function _AnimationItem({ animation, className, ...props }: AniamtionItemProps) {
  return (
    <div className="space-y-0.5">
      <button className={cn("w-full aspect-square rounded-xl overflow-hidden border", className)} {...props}>
        <img src={animation.preview} className="h-full w-full" />
      </button>
      <p className="text-xs font-medium text-center text-foreground/60">{animation.label}</p>
    </div>
  );
}

const AnimationItem = observer(_AnimationItem);
const ExitAnimations = observer(_ExitAnimations);
const EntryAnimations = observer(_EntryAnimations);
export const AnimationSidebar = observer(_AnimationSidebar);
