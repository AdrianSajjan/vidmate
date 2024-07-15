import { useInitializeRecorder } from "@/context/canvas";
import { observer } from "mobx-react";

function _EditorRecorder() {
  const [ref] = useInitializeRecorder();
  return <canvas ref={ref} id="recorder" />;
}

export const EditorRecorder = observer(_EditorRecorder);
