import type { AuthCardProps } from "./AuthCard.types";
import { Card } from "../../../components/Card/Card.web";
import { CardHeader } from "../../../components/Card/CardHeader.web";
import { CardBody } from "../../../components/Card/CardBody.web";
import { CardFooter } from "../../../components/Card/CardFooter.web";

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <Card padding="none" elevation="sm" style={{ width: "100%", maxWidth: 420 }}>
      <CardHeader>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{title}</h1>
          {subtitle ? <p style={{ margin: 0, fontSize: 12, color: "var(--ui-muted-fg)" }}>{subtitle}</p> : null}
        </div>
      </CardHeader>

      <CardBody>{children}</CardBody>

      {footer ? <CardFooter>{footer}</CardFooter> : null}
    </Card>
  );
}
