"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button, Tip } from "@repo/ui";

export function ActionDemo({
  onTrigger,
}: {
  onTrigger: () => Promise<void>;
}) {
  const [triggering, setTriggering] = React.useState(false);

  const handleTrigger = React.useCallback(async () => {
    setTriggering(true);
    try {
      await onTrigger();
      toast.success("Dummy action triggered", {
        description: "Tracked demo_action_triggered.",
      });
    } catch (error) {
      toast.error("Could not trigger dummy action", {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setTriggering(false);
    }
  }, [onTrigger]);

  return (
    <>
      <Tip title="Action demo">
        <div className="flex flex-col gap-3 sm:items-center sm:justify-between">
          <p className="max-w-2xl">
            Trigger a dummy action to verify that platform grouping and
            recent history update together.
          </p>
          <Button
            variant="outline"
            size="sm"
            loading={triggering}
            onPress={() => void handleTrigger()}
          >
            <Plus size={13} />
            Trigger dummy action
          </Button>
        </div>
      </Tip>
    </>
  );
}
