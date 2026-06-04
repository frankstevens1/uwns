"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button, Tip } from "@repo/ui";

export function ActivityDemo({
  onTrigger,
}: {
  onTrigger: () => Promise<void>;
}) {
  const [triggering, setTriggering] = React.useState(false);

  const handleTrigger = React.useCallback(async () => {
    setTriggering(true);
    try {
      await onTrigger();
      toast.success("Dummy event triggered", {
        description: "Tracked demo_activity_triggered.",
      });
    } catch (error) {
      toast.error("Could not trigger dummy event", {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setTriggering(false);
    }
  }, [onTrigger]);

  return (
    <>
      <Tip title="Activity demo">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-2xl">
            Trigger a dummy activity event to verify that platform grouping and
            recent history update together.
          </p>
          <Button
            variant="outline"
            size="sm"
            loading={triggering}
            onPress={() => void handleTrigger()}
          >
            <Plus size={13} />
            Trigger dummy event
          </Button>
        </div>
      </Tip>
    </>
  );
}
