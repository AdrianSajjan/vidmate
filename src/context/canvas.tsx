import { ReactNode, createContext, useCallback, useContext, useState } from "react";
import { observer } from "mobx-react";

import { useEditorContext } from "@/context/editor";
import { Canvas } from "@/store/canvas";

const CanvasContext = createContext<Canvas | null>(null);

function _CanvasProvider({ children, page }: { children?: ReactNode; page: number }) {
  const editor = useEditorContext();

  const canvas = editor.pages.at(page);
  if (!canvas) throw new Error("Canvas is not initialized");

  return <CanvasContext.Provider value={canvas}>{children}</CanvasContext.Provider>;
}

export const CanvasProvider = observer(_CanvasProvider);

export function useCanvasContext() {
  const context = useContext(CanvasContext);
  if (!context) throw new Error("Wrap Component in CanvasProvider");
  return context;
}

export function useInitializeMainCanvas() {
  const canvas = useCanvasContext();
  const [isInitialized, setInitialized] = useState(false);

  const ref = useCallback(
    (element: HTMLCanvasElement) => {
      const workspace = document.getElementById("workspace") as HTMLDivElement;
      if (!element) {
        canvas.instance?.dispose();
        setInitialized(false);
      } else {
        canvas.onInitializeMainCanvas(element, workspace);
        setInitialized(true);
      }
    },
    [canvas],
  );

  return [ref, { isInitialized }] as const;
}

export function useInitializeRecorderCanvas() {
  const canvas = useCanvasContext();
  const [isInitialized, setInitialized] = useState(false);

  const ref = useCallback(
    (element: HTMLCanvasElement) => {
      if (!element) {
        canvas.recorder?.dispose();
        setInitialized(false);
      } else {
        canvas.onInitializeRecorderCanvas(element);
        setInitialized(true);
      }
    },
    [canvas],
  );

  return [ref, { isInitialized }] as const;
}
