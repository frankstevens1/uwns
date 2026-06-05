import { useActions } from "@repo/providers";
import { ActionPlatforms } from "./ActionPlatforms.native";

export function ActionsSection() {
  const { actions, error, loading } = useActions();

  return (
    <ActionPlatforms actions={actions} error={error} loading={loading} />
  );
}
