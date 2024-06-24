import { ReactNode, createContext, useContext, useState } from "react";

import { createInstance } from "@/lib/utils";
import { Editor } from "@/store/editor";

export const EditorContext = createContext<Editor | null>(null);

export function EditorProvider({ children }: { children?: ReactNode }) {
  const [store] = useState(() => createInstance(Editor));
  return <EditorContext.Provider value={store}>{children}</EditorContext.Provider>;
}

export function useEditorContext() {
  const context = useContext(EditorContext);
  if (!context) throw new Error("Wrap Component in EditorProvider");
  return context;
}
