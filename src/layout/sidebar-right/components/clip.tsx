import { Fragment, useEffect, useMemo, useState } from "react";
import { XIcon } from "lucide-react";
import { observer } from "mobx-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

import { useEditorContext } from "@/context/editor";
import { abstract, basic, frames } from "@/constants/elements";
import { propertiesToInclude } from "@/fabric/constants";
import { cn } from "@/lib/utils";

function _ClipMaskSidebar() {
  const editor = useEditorContext();
  const selected = editor.canvas.selection.active!;

  const [clipMask, setClipMask] = useState<string>();
  const [expanded, setExpanded] = useState<false | string>(false);

  useEffect(() => {
    if (!selected.clipPath) {
      setClipMask(undefined);
    } else {
      const clipPath = editor.canvas.instance.getItemByName(selected.clipPath.name);
      if (clipPath) {
        clipPath.clone((clone: fabric.Object) => {
          clone.set({ visible: true, opacity: 1 });
          setClipMask(clone.toDataURL({ format: "image/webp" }));
        }, propertiesToInclude);
      } else {
        setClipMask(undefined);
      }
    }
  }, [selected]);

  const scene = useMemo(() => {
    return editor.canvas.elements.filter((element) => element.name !== selected.name);
  }, [editor.canvas.elements, editor.canvas.elements.length, selected]);

  return (
    <div className="h-full w-full">
      <div className="flex items-center h-14 border-b px-4 gap-2.5">
        <h2 className="font-semibold">Clip Mask</h2>
        <Button size="icon" variant="outline" className="bg-card h-7 w-7 ml-auto" onClick={() => editor.setActiveSidebarRight(null)}>
          <XIcon size={15} />
        </Button>
      </div>
      {!expanded ? (
        <div className="p-4 flex flex-col gap-4 sidebar-container">
          {clipMask ? (
            <div className="flex flex-col gap-3 pb-2">
              <div className="bg-transparent-pattern p-6">
                <img src={clipMask} className="w-full h-auto" />
              </div>
              <Button size="sm" variant="outline" className="w-full" onClick={() => editor.canvas.clipper.removeClipMaskFromActiveObject()}>
                Remove clip mask
              </Button>
            </div>
          ) : null}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <h4 className="text-xs font-semibold line-clamp-1">Basic Shapes</h4>
              <Button size="sm" variant="link" className="text-primary font-medium line-clamp-1" onClick={() => setExpanded("basic")}>
                See All
              </Button>
            </div>
            <div className="flex gap-2.5 items-center overflow-x-scroll scrollbar-hidden">
              {basic.slice(0, 10).map(({ name, path, klass, params }) => (
                <button
                  key={name}
                  onClick={() => editor.canvas.clipper.clipActiveObjectFromBasicShape(klass, params)}
                  className="group shrink-0 h-16 w-16 border flex items-center justify-center overflow-hidden rounded-md p-2 text-gray-800/80 dark:text-gray-100/80 transition-colors shadow-sm hover:bg-card hover:text-gray-800 dark:hover:text-gray-100"
                >
                  <svg viewBox="0 0 48 48" aria-label={name} fill="currentColor" className="h-full w-full transition-transform group-hover:scale-105">
                    <path d={path} className="h-full" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <h4 className="text-xs font-semibold line-clamp-1">Abstract Shapes</h4>
              <Button size="sm" variant="link" className="text-primary font-medium line-clamp-1" onClick={() => setExpanded("abstract")}>
                See All
              </Button>
            </div>
            <div className="flex gap-2.5 items-center overflow-x-scroll relative scrollbar-hidden">
              {abstract.slice(0, 10).map(({ name, path, height, width, id }) => {
                const viewbox = `0 0 ${width} ${height}`;
                return (
                  <button
                    key={id}
                    onClick={() => editor.canvas.clipper.clipActiveObjectFromAbstractShape(path, name)}
                    className="group shrink-0 h-16 w-16 border flex items-center justify-center overflow-hidden rounded-md p-2 text-gray-800/80 dark:text-gray-100/80 transition-colors shadow-sm hover:bg-card hover:text-gray-800 dark:hover:text-gray-100"
                  >
                    <svg viewBox={viewbox} aria-label={name} fill="currentColor" className="h-full w-full transition-transform group-hover:scale-105">
                      <path d={path} className="h-full" />
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <h4 className="text-xs font-semibold line-clamp-1">Frames</h4>
              <Button size="sm" variant="link" className="text-primary font-medium line-clamp-1" onClick={() => setExpanded("frames")}>
                See All
              </Button>
            </div>
            <div className="flex gap-2.5 items-center overflow-x-scroll relative scrollbar-hidden">
              {frames.slice(0, 10).map(({ name, path, height, width, id }) => {
                const viewbox = `0 0 ${width} ${height}`;
                return (
                  <button
                    key={id}
                    onClick={() => editor.canvas.clipper.clipActiveObjectFromAbstractShape(path, name)}
                    className="group shrink-0 h-16 w-16 border flex items-center justify-center overflow-hidden rounded-md p-2 text-gray-800/80 dark:text-gray-100/80 transition-colors shadow-sm hover:bg-card hover:text-gray-800 dark:hover:text-gray-100"
                  >
                    <svg viewBox={viewbox} aria-label={name} fill="currentColor" className="h-full w-full transition-transform group-hover:scale-105">
                      <path d={path} className="h-full" />
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <h4 className="text-xs font-semibold line-clamp-1">Scene Elements</h4>
              <Button size="sm" variant="link" className="text-primary font-medium line-clamp-1" onClick={() => setExpanded("scene")}>
                See All
              </Button>
            </div>
            <div className="flex gap-2.5 items-center overflow-x-scroll scrollbar-hidden relative">
              {scene.length ? (
                scene.slice(0, 10).map((element) => <SceneElement key={element.name} element={element} />)
              ) : (
                <Fragment>
                  {Array.from({ length: 3 }, (_, index) => (
                    <Skeleton key={index} className="h-16 flex-1 rounded-md" />
                  ))}
                  <span className="text-xs font-semibold text-foreground/60 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 leading-none">No Elements</span>
                </Fragment>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="px-3 pt-4 flex flex-col gap-4 sidebar-container">
          <Breadcrumb>
            <BreadcrumbList className="sm:gap-1 gap-1">
              <BreadcrumbItem>
                <Button variant="ghost" size="sm" className="text-xs h-6 px-2 text-foreground/30 hover:text-foreground/40" onClick={() => setExpanded(false)}>
                  Shapes
                </Button>
              </BreadcrumbItem>
              <BreadcrumbSeparator>/</BreadcrumbSeparator>
              <BreadcrumbItem>
                <Button disabled variant="ghost" size="sm" className="text-xs h-6 px-2 capitalize disabled:opacity-100">
                  {expanded}
                </Button>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="grid grid-cols-3 gap-2.5 relative">
            <ExpandedGridView match={expanded} scene={scene} />
          </div>
        </div>
      )}
    </div>
  );
}

function _SceneElement({ element, className }: { element: fabric.Object; className?: string }) {
  const editor = useEditorContext();
  const [objectURL, setObjectURL] = useState("");

  useEffect(() => {
    const object = editor.canvas.instance?.getItemByName(element.name);
    object?.clone((clone: fabric.Object) => {
      clone.opacity = 1;
      clone.visible = true;
      clone.clipPath = undefined;
      setObjectURL(clone.toDataURL({ format: "jpeg", quality: 0.75, withoutShadow: true, withoutTransform: true }));
    });
  }, [element, editor.canvas.instance]);

  const handleAddClipPath = () => {
    const object = editor.canvas.instance.getItemByName(element.name);
    if (object) editor.canvas.clipper.clipActiveObjectFromSceneElement(object);
  };

  return (
    <button
      onClick={handleAddClipPath}
      className={cn(
        "group shrink-0 h-16 w-16 border flex items-center justify-center overflow-hidden rounded-md p-2 text-gray-800/80 dark:text-gray-100/80 transition-colors shadow-sm hover:bg-card hover:text-gray-800 dark:hover:text-gray-100",
        className,
      )}
    >
      <img src={objectURL} alt={element.name?.split("_").at(0)} />
    </button>
  );
}

function _ExpandedGridView({ match, scene }: { match: string; scene: fabric.Object[] }) {
  const editor = useEditorContext();

  switch (match) {
    case "basic":
      return basic.map(({ name, path, klass, params }) => {
        return (
          <button
            key={name}
            onClick={() => editor.canvas.clipper.clipActiveObjectFromBasicShape(klass, params)}
            className="group shrink-0 w-full aspect-square border flex items-center justify-center overflow-hidden rounded-lg p-2 text-gray-800/80 dark:text-gray-100/80 transition-colors shadow-sm hover:bg-card hover:text-gray-800 dark:hover:text-gray-100"
          >
            <svg viewBox="0 0 48 48" aria-label={name} fill="currentColor" className="h-full w-full transition-transform group-hover:scale-105">
              <path d={path} className="h-full" />
            </svg>
          </button>
        );
      });

    case "abstract":
      return abstract.map(({ name, id, path, height, width }) => {
        const viewbox = `0 0 ${width} ${height}`;
        return (
          <button
            key={id}
            onClick={() => editor.canvas.clipper.clipActiveObjectFromAbstractShape(path, name)}
            className="group shrink-0 w-full aspect-square border flex items-center justify-center overflow-hidden rounded-lg p-2 text-gray-800/80 dark:text-gray-100/80 transition-colors shadow-sm hover:bg-card hover:text-gray-800 dark:hover:text-gray-100"
          >
            <svg viewBox={viewbox} aria-label={name} fill="currentColor" className="h-full w-full transition-transform group-hover:scale-105">
              <path d={path} className="h-full" />
            </svg>
          </button>
        );
      });

    case "frames":
      return frames.map(({ name, id, path, height, width }) => {
        const viewbox = `0 0 ${width} ${height}`;
        return (
          <button
            key={id}
            onClick={() => editor.canvas.clipper.clipActiveObjectFromAbstractShape(path, name)}
            className="group shrink-0 w-full aspect-square border flex items-center justify-center overflow-hidden rounded-lg p-2 text-gray-800/80 dark:text-gray-100/80 transition-colors shadow-sm hover:bg-card hover:text-gray-800 dark:hover:text-gray-100"
          >
            <svg viewBox={viewbox} aria-label={name} fill="currentColor" className="h-full w-full transition-transform group-hover:scale-105">
              <path d={path} className="h-full" />
            </svg>
          </button>
        );
      });

    case "scene":
      return scene.length ? (
        scene.map((element) => {
          return <SceneElement key={element.name} element={element} className="w-full h-full aspect-square" />;
        })
      ) : (
        <Fragment>
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-full w-full aspect-square rounded-md" />
          ))}
          <span className="text-xs font-semibold text-foreground/60 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 leading-none">No Elements</span>
        </Fragment>
      );

    default:
      return null;
  }
}

const SceneElement = observer(_SceneElement);
const ExpandedGridView = observer(_ExpandedGridView);
export const ClipMaskSidebar = observer(_ClipMaskSidebar);
