import { useEditorContext } from "@/context/editor";
import { useCallback, useState } from "react";

export function useInitializeCanvas() {
  const editor = useEditorContext();
  const [isInitialized, setInitialized] = useState(false);

  const ref = useCallback(
    (element: HTMLCanvasElement) => {
      const workspace = document.getElementById("workspace") as HTMLDivElement;
      if (!element) {
        editor.canvas.instance?.dispose();
        setInitialized(false);
      } else {
        editor.canvas.onInitialize(element, workspace);
        setInitialized(true);
      }
    },
    [editor],
  );

  return [ref, { isInitialized }] as const;
}

export function useInitializeRecorder() {
  const editor = useEditorContext();
  const [isInitialized, setInitialized] = useState(false);

  const ref = useCallback(
    (element: HTMLCanvasElement) => {
      if (!element) {
        editor.recorder.destroy();
        setInitialized(false);
      } else {
        editor.recorder.initialize(element);
        setInitialized(true);
      }
    },
    [editor.recorder],
  );

  return [ref, { isInitialized }] as const;
}
