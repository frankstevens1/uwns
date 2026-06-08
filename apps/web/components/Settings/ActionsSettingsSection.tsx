"use client";

import * as React from "react";

import { useActions } from "@repo/providers";
import {
  ActionHistoryContent,
  ActionHistoryHeader,
} from "./Actions/ActionHistory";
import { ActionDemo } from "./Actions/demo/ActionDemo";
import { ActionPlatforms } from "./Actions/ActionPlatforms.web";
import { getActionsForPlatform } from "./Actions/utils";
import { SettingsTwoColumnLayout } from "./SettingsTwoColumnLayout";

export function ActionsSettingsSection() {
  const { actions, error, loading, trackAction } = useActions();
  const [selectedPlatformKey, setSelectedPlatformKey] = React.useState<
    string | null
  >(null);
  const historyActions = React.useMemo(
    () => getActionsForPlatform(actions, selectedPlatformKey),
    [actions, selectedPlatformKey],
  );

  const triggerDemoAction = React.useCallback(async () => {
    await trackAction({
      actionName: "demo_action_triggered",
      uniqueKey: makeDemoActionUniqueKey(),
      metadata: {
        source: "settings",
        screen: "settings_actions",
        trigger: "demo_button",
      },
    });
  }, [trackAction]);

  React.useEffect(() => {
    void trackAction({
      actionName: "actions_viewed",
      uniqueKey: "web:settings:actions_viewed",
      metadata: {
        source: "settings",
        screen: "settings_actions",
        trigger: "first_page_visit",
      },
    });
  }, [trackAction]);

  return (
    <SettingsTwoColumnLayout
      left={
        <>
          <ActionPlatforms
            actions={actions}
            onSelectedPlatformKeyChange={setSelectedPlatformKey}
          />
          <ActionDemo onTrigger={triggerDemoAction} />
        </>
      }
      rightHeader={<ActionHistoryHeader actionCount={historyActions.length} />}
      rightContent={
        <ActionHistoryContent
          error={error}
          loading={loading}
          actions={historyActions}
        />
      }
    />
  );
}

function makeDemoActionUniqueKey() {
  const suffix = `${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
  return `web:settings:actions:demo:${suffix}`;
}
