import { observer } from "mobx-react";
import { HTMLAttributes, useMemo } from "react";
import { upperFirst } from "lodash";

import { XIcon } from "lucide-react";
import { CaretSortIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";

import { useEditorContext } from "@/context/editor";
import { usePreviewAnimation } from "@/hooks/use-preview-animation";
import { useAnimationControls } from "@/layout/sidebar-right/hooks/use-animation-controls";
import { useAnimationList } from "@/layout/sidebar-right/hooks/use-animations";

import { cn } from "@/lib/utils";
import { EditorAnimation, defaultSpringConfig, easings, entry, exit, scene } from "@/constants/animations";
import { FabricUtils } from "@/fabric/utils";
import { calculateSpringAnimationDuration, visualizeSpringAnimation } from "@/lib/animations";

function _AnimationSidebar() {
  const editor = useEditorContext();
  const selected = editor.canvas.selection.active!;

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
            <TabsTrigger value="scene" className="text-xs h-full">
              Scene
            </TabsTrigger>
            <TabsTrigger value="out" className="text-xs h-full">
              Out
            </TabsTrigger>
          </TabsList>
          <TabsContent value="in" className="mt-0 pt-5">
            <Animations animations={entry} selected={selected} type="in" />
          </TabsContent>
          <TabsContent value="scene" className="mt-0 pt-5">
            <Animations animations={scene} selected={selected} type="scene" />
          </TabsContent>
          <TabsContent value="out" className="mt-0 pt-5">
            <Animations animations={exit} selected={selected} type="out" />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

interface AnimationProps {
  animations: EditorAnimation[];
  type: "in" | "out" | "scene";
  selected: fabric.Object;
}

function _Animations({ animations: list, selected, type }: AnimationProps) {
  const controls = useAnimationControls(selected, type);
  const animations = useAnimationList(selected, list);
  usePreviewAnimation(selected, type);

  return (
    <div className="flex flex-col px-1">
      <AnimationControls selected={selected} type={type} animations={list} />
      <div className="pt-7 flex flex-col gap-7">
        {animations.map((animation) => (
          <div className="flex flex-col gap-4" key={animation.title}>
            <h4 className="text-xs font-medium text-center">{animation.title}</h4>
            <div className="grid grid-cols-2 @sm:grid-cols-3 @md:grid-cols-4 gap-5">
              {animation.list.map((animation) => (
                <AnimationItem key={animation.label} animation={animation} selected={selected.anim?.[type].name === animation.value} onClick={() => controls.selectAnimation(animation)} />
              ))}
            </div>
          </div>
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

interface AnimationControlsProps {
  selected: fabric.Object;
  type: "in" | "out" | "scene";
  animations: EditorAnimation[];
}

function _AnimationControls({ selected, type, animations }: AnimationControlsProps) {
  const controls = useAnimationControls(selected, type);
  const animation = animations.find((animation) => animation.value === selected.anim?.[type].name);

  const spring = useMemo(() => {
    return { graph: visualizeSpringAnimation(), duration: calculateSpringAnimationDuration() };
  }, []);

  const text = selected.anim?.[type].text || "letter";
  const easing = selected.anim?.[type].easing || "linear";

  const duration = (selected.anim?.[type].duration || 0) / 1000;
  const disabled = !selected.anim?.[type].name || selected.anim?.[type].name === "none";

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-6">
        <Label className={cn("text-xs shrink-0", disabled || animation?.disabled?.easing ? "opacity-50" : "opacity-100")}>Easing</Label>
        <Select value={easing} onValueChange={controls.changeEasing} disabled={disabled || animation?.disabled?.easing}>
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
      {easing !== "spring" ? (
        <div className="flex items-center justify-between gap-6 mt-3">
          <Label className={cn("text-xs shrink-0", disabled || animation?.disabled?.duration ? "opacity-50" : "opacity-100")}>Duration (s)</Label>
          <Input value={duration} onChange={controls.changeDuration} disabled={disabled || animation?.disabled?.duration} type="number" step={0.1} className="text-xs h-8 w-40" />
        </div>
      ) : (
        <div className="flex items-center justify-between gap-6 mt-3">
          <Label className={cn("text-xs shrink-0", disabled ? "opacity-50" : "opacity-100")}>Physics</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 w-40 justify-between items-center">
                <img src={spring.graph} className="h-8 w-auto -scale-y-100" />
                <CaretSortIcon className="w-4 h-4 opacity-50 shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent onOpenAutoFocus={(event) => event.preventDefault()} className="w-64 flex flex-col" align="end">
              <div className="bg-transparent-pattern rounded-sm overflow-hidden relative">
                <span className="absolute bottom-2 right-2 text-center text-xxs w-fit font-medium">Approximate Duration: {(spring.duration / 1000).toFixed(2)} seconds</span>
                <img src={spring.graph} className="h-full w-auto -scale-y-100" />
              </div>
              <Label className="text-xs font-medium mt-6">Mass</Label>
              <div className="flex items-center justify-between gap-4">
                <Slider min={1} max={100} value={[defaultSpringConfig.mass]} />
                <Input step={0.25} type="number" value={defaultSpringConfig.mass} readOnly className="h-8 w-20 text-xs" />
              </div>
              <Label className="text-xs font-medium mt-4">Stiffness</Label>
              <div className="flex items-center justify-between gap-4">
                <Slider min={0} max={100} value={[defaultSpringConfig.stiffness]} />
                <Input step={0.25} type="number" value={defaultSpringConfig.stiffness} readOnly className="h-8 w-20 text-xs" />
              </div>
              <Label className="text-xs font-medium mt-4">Damping</Label>
              <div className="flex items-center justify-between gap-4">
                <Slider min={0} max={100} value={[defaultSpringConfig.damping]} />
                <Input step={0.25} type="number" value={defaultSpringConfig.damping} readOnly className="h-8 w-20 text-xs" />
              </div>
              <Label className="text-xs font-medium mt-4">Velocity</Label>
              <div className="flex items-center justify-between gap-4">
                <Slider min={0} max={100} value={[defaultSpringConfig.velocity]} />
                <Input step={0.25} type="number" value={defaultSpringConfig.velocity} readOnly className="h-8 w-20 text-xs" />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
      {FabricUtils.isTextboxElement(selected) ? (
        <div className="flex items-center justify-between gap-6 mt-3">
          <Label className={cn("text-xs shrink-0", disabled || animation?.disabled?.text ? "opacity-50" : "opacity-100")}>Text Animate</Label>
          <Select value={text} onValueChange={controls.changeTextAnimate} disabled={disabled || animation?.disabled?.text || animation?.type !== "textbox"}>
            <SelectTrigger className="h-8 text-xs w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["letter", "word", "line"].map((type) => (
                <SelectItem key={type} className="text-xs" value={type}>
                  {upperFirst(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
    </div>
  );
}

const Animations = observer(_Animations);
const AnimationItem = observer(_AnimationItem);
const AnimationControls = observer(_AnimationControls);

export const AnimationSidebar = observer(_AnimationSidebar);
