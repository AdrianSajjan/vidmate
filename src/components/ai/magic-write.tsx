import { observer } from "mobx-react";
import { RefreshCcwIcon } from "lucide-react";
import { noop } from "lodash";

import { useEditorContext } from "@/context/editor";
import { AISelectPluginProps } from "@/layout/sidebar-right/components/ai";
import { Skeleton } from "@/components/ui/skeleton";
import { useGenerateCTASuggestions, useGenerateDescriptionSuggestions, useGenerateHeadlineSuggestions } from "@/api/ai";
import { cn } from "@/lib/utils";

type QueryFunction = typeof useGenerateCTASuggestions;

const magicWriteMap: Record<string, QueryFunction> = {
  "cta-text": useGenerateCTASuggestions,
  "headline-text": useGenerateHeadlineSuggestions,
  "description-text": useGenerateDescriptionSuggestions,
};

function _MagicWritePlugin({}: Omit<AISelectPluginProps, "plugin">) {
  const editor = useEditorContext();
  const selected = editor.canvas.selection.active! as fabric.Textbox;

  const useMagicWrite = magicWriteMap[selected.meta!.label] || noop;
  const query = useMagicWrite(editor.adapter.product!, editor.adapter.objective!);

  if (!query) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex w-full items-center">
        <button className="text-xs text-primary inline-flex items-center gap-1 ml-auto" disabled={query.isFetching} onClick={() => query.refetch()}>
          <span className={cn(query.isFetching ? "animate-spin" : "animate-none")}>
            <RefreshCcwIcon size={12} />
          </span>
          <span>Refresh</span>
        </button>
      </div>
      {!query.data || !query.data.length ? (
        query.isPending ? (
          Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="w-full h-8" />)
        ) : (
          <p className="text-destructive text-xs text-center">Unable to generate suggestions</p>
        )
      ) : (
        query.data.map((suggestion, index) => (
          <div role="button" key={suggestion + index} tabIndex={0} className="text-xs border rounded-md font-medium p-3" onClick={() => editor.canvas.onChangeActiveTextboxProperty("text", suggestion)}>
            {suggestion}
          </div>
        ))
      )}
    </div>
  );
}

export const MagicWritePlugin = observer(_MagicWritePlugin);
