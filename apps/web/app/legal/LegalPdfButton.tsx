"use client";

import * as React from "react";
import { Button } from "@repo/ui";

export function LegalPdfButton({ title }: { title: string }) {
  const handleClick = React.useCallback(() => {
    window.print();
  }, []);

  return (
    <Button
      variant="outline"
      size="sm"
      onPress={handleClick}
      aria-label={`Download ${title} as PDF`}
    >
      Download PDF
    </Button>
  );
}
