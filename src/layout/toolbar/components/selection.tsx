import { observer } from "mobx-react";
import { BlendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

function _ActiveSelectionToolbar() {
  return (
    <div className="flex items-center h-full w-full overflow-x-scroll scrollbar-hidden">
      <Button size="sm" variant="outline" className="gap-1.5">
        <BlendIcon size={15} />
        <span>Combine</span>
      </Button>
    </div>
  );
}

export const ActiveSelectionToolbar = observer(_ActiveSelectionToolbar);
