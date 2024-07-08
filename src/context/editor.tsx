import { ReactNode, createContext, useContext } from "react";

import { createInstance } from "@/lib/utils";
import { Editor } from "@/store/editor";

export const EditorContext = createContext<Editor | null>(null);
export const editor = createInstance(Editor);

export function EditorProvider({ children }: { children?: ReactNode }) {
  return <EditorContext.Provider value={editor}>{children}</EditorContext.Provider>;
}

export function useEditorContext() {
  const context = useContext(EditorContext);
  if (!context) throw new Error("Wrap Component in EditorProvider");
  return context;
}
