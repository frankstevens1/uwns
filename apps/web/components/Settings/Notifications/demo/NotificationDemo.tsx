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
  ToggleGroup,
  ToggleGroupItem,
  Tip,
  Textarea,
} from "@repo/ui";
import {
  getNotificationGroupConfig,
  isAbsoluteHttpUrl,
  notificationDestinations,
  type NotificationPreference,
} from "@repo/lib";
import type { NotificationContextValue } from "@repo/providers";
import {
  demoKeyPattern,
  demoNotificationDefaults,
  demoReadModeOptions,
} from "../constants";
import type { GeneratorReadMode } from "../types";

type DemoTargetType = "app_destination" | "external_url";

export function NotificationDemo({
  preferences,
  onCreate,
}: {
  preferences: NotificationPreference[];
  onCreate: NotificationContextValue["createNotification"];
}) {
  const [generatorOpen, setGeneratorOpen] = React.useState(false);

  return (
    <>
      <Tip title="Notification demo">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-2xl">
            Create a test notification to verify delivery and read behavior.
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
        preferences={preferences}
        onCreate={onCreate}
        onOpenChange={setGeneratorOpen}
      />
    </>
  );
}

function NotificationGeneratorDialog({
  open,
  preferences,
  onCreate,
  onOpenChange,
}: {
  open: boolean;
  preferences: NotificationPreference[];
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
  const [targetType, setTargetType] = React.useState<DemoTargetType>(
    demoNotificationDefaults.targetType,
  );
  const [destinationId, setDestinationId] = React.useState<string>(
    demoNotificationDefaults.destinationId,
  );
  const [externalUrl, setExternalUrl] = React.useState<string>(
    demoNotificationDefaults.externalUrl,
  );
  const [readMode, setReadMode] = React.useState<GeneratorReadMode>(
    demoNotificationDefaults.readMode,
  );
  const [actionName, setActionName] = React.useState<string>(
    demoNotificationDefaults.actionName,
  );
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);

  const destinationOptions = React.useMemo(
    () =>
      notificationDestinations.map((destination) => ({
        label: destination.label,
        value: destination.id,
      })),
    [],
  );
  const groupOptions = React.useMemo(
    () =>
      preferences.map((preference) => ({
        label: getNotificationGroupConfig(preference.group_key).label,
        value: preference.group_key,
      })),
    [preferences],
  );
  const fallbackGroupKey = React.useMemo(() => {
    if (
      groupOptions.some(
        (option) => option.value === demoNotificationDefaults.groupKey,
      )
    ) {
      return demoNotificationDefaults.groupKey;
    }
    return groupOptions[0]?.value ?? demoNotificationDefaults.groupKey;
  }, [groupOptions]);
  const selectedDestination = React.useMemo(
    () =>
      notificationDestinations.find((destination) => destination.id === destinationId) ??
      null,
    [destinationId],
  );
  const hasGroups = groupOptions.length > 0;

  React.useEffect(() => {
    if (open) return;
    setFormError(null);
    setMessage(null);
  }, [open]);

  React.useEffect(() => {
    if (!hasGroups) return;
    if (groupOptions.some((option) => option.value === groupKey)) return;
    setGroupKey(fallbackGroupKey);
  }, [fallbackGroupKey, groupKey, groupOptions, hasGroups]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextTitle = title.trim();
    const nextBody = body.trim();
    const nextGroupKey = groupKey.trim();
    const nextActionName = actionName.trim();
    const nextExternalUrl = externalUrl.trim();

    setMessage(null);
    setFormError(null);

    if (!nextTitle || !nextBody) {
      setFormError("Title and message are required.");
      return;
    }

    if (!hasGroups || !demoKeyPattern.test(nextGroupKey)) {
      setFormError("Choose a group.");
      return;
    }

    if (readMode === "action" && !demoKeyPattern.test(nextActionName)) {
      setFormError("Use a valid action name.");
      return;
    }

    const target =
      targetType === "app_destination"
        ? selectedDestination
          ? {
              type: "app_destination" as const,
              target: selectedDestination.id,
            }
          : null
        : nextExternalUrl && isAbsoluteHttpUrl(nextExternalUrl)
          ? {
              type: "external_url" as const,
              target: nextExternalUrl,
            }
          : null;

    if (!target) {
      setFormError(
        targetType === "app_destination"
          ? "Choose a target."
          : "Enter an absolute URL.",
      );
      return;
    }

    setSubmitting(true);
    const created = await onCreate({
      groupKey: nextGroupKey,
      type: readMode === "action" ? "demo_action" : "demo_manual",
      title: nextTitle,
      body: nextBody,
      target,
      metadata:
        readMode === "action"
          ? {
              autoReadOnly: true,
              autoReadActionName: nextActionName,
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
      readMode === "action"
        ? `Created. Track ${nextActionName} to mark it read.`
        : "Created. Mark it read from the notification UI.",
    );
  };

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="max-w-md">
          <DialogTitle>Demo notification</DialogTitle>
          <DialogDescription>Create a test notification.</DialogDescription>

          <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <Field label="Group">
                <Select
                  value={groupKey}
                  onChange={setGroupKey}
                  options={groupOptions}
                  placeholder="Choose group"
                  disabled={submitting || !hasGroups}
                />
              </Field>

              <Field label="Title">
                <Input
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Title"
                  disabled={submitting}
                />
              </Field>
            </div>

            <Field label="Message">
              <Textarea
                value={body}
                onChangeText={setBody}
                placeholder="Message"
                rows={2}
                disabled={submitting}
              />
            </Field>

            <Field label="Target">
              <div className="grid gap-2 sm:grid-cols-[auto_minmax(0,1fr)]">
                <ToggleGroup
                  ariaLabel="Notification target type"
                  value={targetType}
                  onValueChange={(value) => {
                    setTargetType(
                      value === "external_url"
                        ? "external_url"
                        : "app_destination",
                    );
                  }}
                  className="shrink-0"
                >
                  <ToggleGroupItem value="app_destination">
                    In-app
                  </ToggleGroupItem>
                  <ToggleGroupItem value="external_url">URL</ToggleGroupItem>
                </ToggleGroup>

                {targetType === "app_destination" ? (
                  <Select
                    value={destinationId}
                    onChange={setDestinationId}
                    options={destinationOptions}
                    placeholder="Choose target"
                    disabled={submitting}
                    search
                  />
                ) : (
                  <Input
                    value={externalUrl}
                    onChangeText={setExternalUrl}
                    placeholder="https://example.com"
                    disabled={submitting}
                  />
                )}
              </div>
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Read mode">
                <Select
                  value={readMode}
                  onChange={(value) =>
                    setReadMode(value === "action" ? "action" : "manual")
                  }
                  options={[...demoReadModeOptions]}
                  disabled={submitting}
                />
              </Field>

              {readMode === "action" ? (
                <Field label="Action name">
                  <Input
                    value={actionName}
                    onChangeText={setActionName}
                    placeholder="account_viewed"
                    disabled={submitting}
                  />
                </Field>
              ) : null}
            </div>

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
              <Button
                variant="primary"
                loading={submitting}
                disabled={!hasGroups}
                type="submit"
              >
                Create notification
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <span className="text-xs font-medium text-(--ui-fg)">{label}</span>
      {children}
    </div>
  );
}

function makeDemoNotificationUniqueKey() {
  const suffix = `${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
  return `demo:generated:${suffix}`;
}
