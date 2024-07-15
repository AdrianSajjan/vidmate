import { useInitializeRecorder } from "@/hooks/use-canvas";
import { observer } from "mobx-react";

function _EditorRecorder() {
  const [ref] = useInitializeRecorder();
  return <canvas ref={ref} id="recorder" className="hidden" />;
}

export const EditorRecorder = observer(_EditorRecorder);
