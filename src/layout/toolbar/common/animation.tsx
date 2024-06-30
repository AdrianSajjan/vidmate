import { Button } from "@/components/ui/button";
import { LayersIcon, SparklesIcon } from "lucide-react";
import { observer } from "mobx-react";

function _ToolbarAnimationOption() {
  return (
    <div className="flex items-center gap-4">
      <Button size="sm" variant="outline" className="gap-1.5">
        <LayersIcon size={15} />
        <span>Animations</span>
      </Button>
      <Button size="sm" variant="outline" className="gap-1.5">
        <SparklesIcon size={15} />
        <span>Effects</span>
      </Button>
    </div>
  );
}

export const ToolbarAnimationOption = observer(_ToolbarAnimationOption);
