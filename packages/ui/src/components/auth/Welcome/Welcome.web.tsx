import type { WelcomeProps } from "./Welcome.types";
import { Card } from "../../../components/Card/Card.web";
import { CardHeader } from "../../../components/Card/CardHeader.web";
import { CardBody } from "../../../components/Card/CardBody.web";
import { CardFooter } from "../../../components/Card/CardFooter.web";
import { Button } from "../../../primitives/Button/Button.web";
import { Link } from "../../../primitives/Link/Link.web";

export function Welcome({
  email,
  title = "Check your email",
  description = "We’ve sent you a link to continue.",
  onOpenMailbox,
  onContinue,
}: WelcomeProps) {
  return (
    <Card padding="none" elevation="sm" style={{ maxWidth: 420 }}>
      <CardHeader>
        <div className="space-y-1">
          <h1 className="font-semibold" style={{ fontSize: "var(--ui-font-lg)" }}>
            {title}
          </h1>
          <p style={{ fontSize: "var(--ui-font-sm)", color: "var(--ui-muted-fg)" }}>
            {description}
          </p>
        </div>
      </CardHeader>

      <CardBody>
        {email && (
          <p style={{ fontSize: "var(--ui-font-sm)", color: "var(--ui-fg)" }}>
            Sent to <span className="font-medium">{email}</span>
          </p>
        )}
      </CardBody>

      <CardFooter>
        <div className="flex flex-col gap-2">
          {onOpenMailbox && (
            <Button onPress={onOpenMailbox}>Open mailbox</Button>
          )}

          {onContinue && (
            <Link onPress={onContinue}>Back to login</Link>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
