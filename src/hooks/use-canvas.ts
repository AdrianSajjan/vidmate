import { useEditorContext } from "@/context/editor";
import { useCallback, useState } from "react";

export function useInitializeCanvas(index: number) {
  const editor = useEditorContext();
  const [isInitialized, setInitialized] = useState(false);

  const ref = useCallback(
    (element: HTMLCanvasElement) => {
      const canvas = editor.pages[index];
      const workspace = document.getElementById("workspace") as HTMLDivElement;

      if (!canvas || !workspace) return;

      if (!element) {
        canvas.destroy();
        setInitialized(false);
      } else {
        canvas.initialize(element, workspace);
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
