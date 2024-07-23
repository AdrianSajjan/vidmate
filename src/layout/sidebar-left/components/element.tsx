import { observer } from "mobx-react";
import { useState } from "react";

import { SearchIcon, XIcon } from "lucide-react";

import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useEditorContext } from "@/context/editor";
import { advancedShapes, basicShapes, lines } from "@/constants/elements";
import { cn } from "@/lib/utils";

function _ElementSidebar() {
  const editor = useEditorContext();

  const [expanded, setExpanded] = useState<false | string>(false);

  return (
    <div className="h-full w-full">
      <div className="flex items-center justify-between h-14 border-b px-4">
        <h2 className="font-semibold">Elements</h2>
        <Button size="icon" variant="outline" className="bg-card h-7 w-7" onClick={() => editor.setActiveSidebarLeft(null)}>
          <XIcon size={16} />
        </Button>
      </div>
      <section className="sidebar-container">
        <div className={cn("px-3 pt-4 flex flex-col gap-2.5 border-b", expanded ? "border-b pb-2.5" : "pb-6 border-b-0")}>
          <div className="relative">
            <Input placeholder="Search..." className="text-xs pl-8" />
            <SearchIcon size={15} className="absolute top-1/2 -translate-y-1/2 left-2.5 text-foreground/60" />
          </div>
          {expanded ? (
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
          ) : null}
        </div>
        {!expanded ? (
          <div className="px-3 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-4">
                <h4 className="text-xs font-semibold line-clamp-1">Basic Shapes</h4>
                <Button size="sm" variant="link" className="text-primary font-medium line-clamp-1" onClick={() => setExpanded("basic")}>
                  See All
                </Button>
              </div>
              <div className="flex gap-2.5 items-center overflow-x-scroll scrollbar-hidden">
                {basicShapes.map(({ name, path, klass, params }) => (
                  <button
                    key={name}
                    onClick={() => editor.canvas.onAddBasicShape(klass, params)}
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
                <Button size="sm" variant="link" className="text-primary font-medium line-clamp-1" onClick={() => setExpanded("advanced")}>
                  See All
                </Button>
              </div>
              <div className="flex gap-2.5 items-center overflow-x-scroll relative scrollbar-hidden">
                {advancedShapes.map(({ name, path, viewbox = "0 0 48 48" }) => (
                  <button
                    key={name}
                    onClick={() => editor.canvas.onAddAbstractShape(path, name)}
                    className="group shrink-0 h-16 w-16 border flex items-center justify-center overflow-hidden rounded-md p-2 text-gray-800/80 dark:text-gray-100/80 transition-colors shadow-sm hover:bg-card hover:text-gray-800 dark:hover:text-gray-100"
                  >
                    <svg viewBox={viewbox} aria-label={name} fill="currentColor" className="h-full w-full transition-transform group-hover:scale-105">
                      <path d={path} className="h-full" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-4">
                <h4 className="text-xs font-semibold line-clamp-1">Lines</h4>
                <Button size="sm" variant="link" className="text-primary font-medium line-clamp-1">
                  See All
                </Button>
              </div>
              <div className="flex gap-2.5 items-center overflow-x-scroll relative scrollbar-hidden">
                {lines.map(({ name, path, points }) => (
                  <button
                    key={name}
                    onClick={() => editor.canvas.onAddLine(points, name)}
                    className="group shrink-0 h-16 w-16 border flex items-center justify-center overflow-hidden rounded-md p-2 text-gray-800/80 dark:text-gray-100/80 transition-colors shadow-sm hover:bg-card hover:text-gray-800 dark:hover:text-gray-100"
                  >
                    <svg viewBox="0 0 48 48" aria-label={name} fill="currentColor" className="h-full w-full transition-transform group-hover:scale-105">
                      <path d={path} className="h-full" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="px-3 grid grid-cols-3 gap-2.5 pt-4">
            <ExpandedGridView match={expanded} />
          </div>
        )}
      </section>
    </div>
  );
}

function ExpandedGridView({ match }: { match: string }) {
  const editor = useEditorContext();

  switch (match) {
    case "basic":
      return basicShapes.map(({ name, path, klass, params }) => (
        <button
          key={name}
          onClick={() => editor.canvas.onAddBasicShape(klass, params)}
          className="group shrink-0 w-full aspect-square border flex items-center justify-center overflow-hidden rounded-lg p-2 text-gray-800/80 dark:text-gray-100/80 transition-colors shadow-sm hover:bg-card hover:text-gray-800 dark:hover:text-gray-100"
        >
          <svg viewBox="0 0 48 48" aria-label={name} fill="currentColor" className="h-full w-full transition-transform group-hover:scale-105">
            <path d={path} className="h-full" />
          </svg>
        </button>
      ));

    case "advanced":
      return advancedShapes.map(({ name, path, viewbox = "0 0 48 48" }) => (
        <button
          key={name}
          onClick={() => editor.canvas.onAddAbstractShape(path, name)}
          className="group shrink-0 w-full aspect-square border flex items-center justify-center overflow-hidden rounded-lg p-2 text-gray-800/80 dark:text-gray-100/80 transition-colors shadow-sm hover:bg-card hover:text-gray-800 dark:hover:text-gray-100"
        >
          <svg viewBox={viewbox} aria-label={name} fill="currentColor" className="h-full w-full transition-transform group-hover:scale-105">
            <path d={path} className="h-full" />
          </svg>
        </button>
      ));

    default:
      return null;
  }
}

export const ElementSidebar = observer(_ElementSidebar);
