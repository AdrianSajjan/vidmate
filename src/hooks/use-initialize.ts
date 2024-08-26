import * as z from "zod";
import { useCallback, useEffect, useMemo, useState } from "react";

import { whitelistOrigins } from "@/config/message";
import { useEditorContext } from "@/context/editor";
import { EditorBrandSchema, EditorProductSchema } from "@/schema/adapter";
import { createInstance } from "@/lib/utils";
import { EditorMode } from "@/store/editor";

const Schema = z.object({
  product: EditorProductSchema,
  objective: z.string(),
  brand: EditorBrandSchema,
  adapter: z.union([z.literal("create"), z.literal("edit")]),
});

export function useInitializeEditor() {
  const editor = useEditorContext();
  const [isInitialized, setInitialized] = useState(false);

  const mode = useMemo(() => {
    const params = createInstance(URLSearchParams, window.location.search);
    const mode = params.get("mode") as EditorMode | null;
    return mode || "creator";
  }, []);

  const handleEvent = useCallback((event: MessageEvent) => {
    if (!whitelistOrigins.includes(event.origin) || isInitialized) return;
    try {
      const payload = Schema.parse(JSON.parse(event.data));
      editor.adapter.initialize({ product: payload.product, objective: payload.objective, brand: payload.brand, mode: payload.adapter });
      editor.initialize("adapter");
      setInitialized(true);
    } catch (error) {
      editor.changeStatus("error");
      console.warn(error);
    }
  }, []);

  useEffect(() => {
    if (mode === "creator") {
      editor.initialize();
    } else {
      window.addEventListener("message", handleEvent);
      window.parent.postMessage(JSON.stringify({ action: "ready" }), "*");
      return () => window.removeEventListener("message", handleEvent);
    }
  }, []);

  return isInitialized;
}
