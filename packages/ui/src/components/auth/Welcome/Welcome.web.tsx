import type { WelcomeProps } from "./Welcome.types";
import { AuthCard } from "../AuthCard/AuthCard.web";
import { Button } from "../../../primitives/Button/Button.web";
import { Link } from "../../../primitives/Link/Link.web";

export function Welcome({
  email,
  title = "Check your email",
  description = "We’ve sent you a link to continue.",
  onOpenMailbox,
  onContinue,
}: WelcomeProps) {
  const footer = onContinue ? (
    <div style={{ fontSize: 13 }}>
      <Link onPress={onContinue}>
        ← Back to <span style={{ fontWeight: "bold" }}>sign in</span>
      </Link>
    </div>
  ) : undefined;

  return (
    <AuthCard title={title} subtitle={description} footer={footer}>
      <div className="flex flex-col gap-3">
        {email && (
          <p style={{ margin: 0, fontSize: 13, color: "var(--ui-fg)" }}>
            Sent to <span className="font-medium">{email}</span>
          </p>
        )}

        {onOpenMailbox && (
          <Button type="button" variant="outline" onPress={onOpenMailbox}>
            Open mailbox
          </Button>
        )}
      </div>
    </AuthCard>
  );
}
