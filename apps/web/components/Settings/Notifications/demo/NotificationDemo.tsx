"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import {
  Button,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  Input,
  Select,
  Tip,
  Textarea,
} from "@repo/ui";
import type { NotificationContextValue } from "@repo/providers";
import {
  demoKeyPattern,
  demoNotificationDefaults,
  demoReadModeOptions,
} from "../constants";
import type { GeneratorReadMode } from "../types";

export function NotificationDemo({
  onCreate,
}: {
  onCreate: NotificationContextValue["createNotification"];
}) {
  const [generatorOpen, setGeneratorOpen] = React.useState(false);

  return (
    <>
      <Tip title="Notification demo">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-2xl">
            Group preferences below control which channels are allowed. Use the
            demo generator to create a test notification and verify web, native,
            and activity-based read behavior.
          </p>
          <Button
            variant="outline"
            size="sm"
            onPress={() => setGeneratorOpen(true)}
          >
            <Plus size={13} />
            Demo notification
          </Button>
        </div>
      </Tip>

      <NotificationGeneratorDialog
        open={generatorOpen}
        onCreate={onCreate}
        onOpenChange={setGeneratorOpen}
      />
    </>
  );
}

function NotificationGeneratorDialog({
  open,
  onCreate,
  onOpenChange,
}: {
  open: boolean;
  onCreate: NotificationContextValue["createNotification"];
  onOpenChange: (open: boolean) => void;
}) {
  const [title, setTitle] = React.useState<string>(
    demoNotificationDefaults.title,
  );
  const [body, setBody] = React.useState<string>(demoNotificationDefaults.body);
  const [groupKey, setGroupKey] = React.useState<string>(
    demoNotificationDefaults.groupKey,
  );
  const [href, setHref] = React.useState<string>(demoNotificationDefaults.href);
  const [readMode, setReadMode] = React.useState<GeneratorReadMode>(
    demoNotificationDefaults.readMode,
  );
  const [eventName, setEventName] = React.useState<string>(
    demoNotificationDefaults.eventName,
  );
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) return;
    setFormError(null);
    setMessage(null);
  }, [open]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextTitle = title.trim();
    const nextBody = body.trim();
    const nextGroupKey = groupKey.trim();
    const nextHref = href.trim();
    const nextEventName = eventName.trim();

    setMessage(null);
    setFormError(null);

    if (!nextTitle || !nextBody) {
      setFormError("Title and message are required.");
      return;
    }

    if (!demoKeyPattern.test(nextGroupKey)) {
      setFormError("Use a valid group key, for example account.");
      return;
    }

    if (readMode === "event" && !demoKeyPattern.test(nextEventName)) {
      setFormError("Use a valid event name, for example account_viewed.");
      return;
    }

    setSubmitting(true);
    const created = await onCreate({
      groupKey: nextGroupKey,
      type: readMode === "event" ? "demo_activity" : "demo_manual",
      title: nextTitle,
      body: nextBody,
      href: nextHref || undefined,
      metadata:
        readMode === "event"
          ? {
              autoReadOnly: true,
              autoReadEventName: nextEventName,
            }
          : {},
      uniqueKey: makeDemoNotificationUniqueKey(),
      channels: { inApp: true, email: true, push: true },
    });
    setSubmitting(false);

    if (!created) {
      setFormError("Could not create notification.");
      return;
    }

    setMessage(
      readMode === "event"
        ? `Created. Track ${nextEventName} to mark it read.`
        : "Created. Mark it read from the notification UI.",
    );
  };

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="max-w-lg">
          <DialogTitle>Demo notification</DialogTitle>
          <DialogDescription>
            Create a real notification for testing group preferences,
            cross-platform delivery, and activity-based read behavior.
          </DialogDescription>

          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-(--ui-fg)">
                Group key
              </span>
              <Input
                value={groupKey}
                onChangeText={setGroupKey}
                placeholder="account"
                disabled={submitting}
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-medium text-(--ui-fg)">Title</span>
              <Input
                value={title}
                onChangeText={setTitle}
                placeholder="Notification title"
                disabled={submitting}
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-medium text-(--ui-fg)">
                Message
              </span>
              <Textarea
                value={body}
                onChangeText={setBody}
                placeholder="Notification body"
                rows={3}
                disabled={submitting}
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-medium text-(--ui-fg)">
                Target URL
              </span>
              <Input
                value={href}
                onChangeText={setHref}
                placeholder="/app/account"
                disabled={submitting}
              />
              <span className="block text-[11px] text-(--ui-muted-fg)">
                Optional route or URL opened from the notification.
              </span>
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-medium text-(--ui-fg)">
                Read mode
              </span>
              <Select
                value={readMode}
                onChange={(value) =>
                  setReadMode(value === "event" ? "event" : "manual")
                }
                options={[...demoReadModeOptions]}
                disabled={submitting}
              />
            </label>

            {readMode === "event" ? (
              <label className="block space-y-1">
                <span className="text-xs font-medium text-(--ui-fg)">
                  Event name
                </span>
                <Input
                  value={eventName}
                  onChangeText={setEventName}
                  placeholder="account_viewed"
                  disabled={submitting}
                />
                <span className="block text-[11px] text-(--ui-muted-fg)">
                  Matching tracked events mark this notification read.
                </span>
              </label>
            ) : null}

            {formError ? (
              <p className="text-xs text-(--ui-danger-fg)">{formError}</p>
            ) : null}
            {message ? (
              <p className="text-xs text-(--ui-muted-fg)">{message}</p>
            ) : null}

            <DialogFooter>
              <Button
                variant="outline"
                disabled={submitting}
                onPress={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" loading={submitting} type="submit">
                Create notification
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  );
}

function makeDemoNotificationUniqueKey() {
  const suffix = `${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
  return `demo:generated:${suffix}`;
}
