import type * as React from "react";

export function SettingsTwoColumnLayout({
  left,
  rightHeader,
  rightContent,
}: {
  left: React.ReactNode;
  rightHeader: React.ReactNode;
  rightContent: React.ReactNode;
}) {
  return (
    <section className="grid gap-6 lg:h-[calc(100dvh-108px-4rem)] lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
      <div className="space-y-6 lg:min-h-0">{left}</div>

      <div className="min-w-0 lg:flex lg:h-full lg:min-h-0 lg:flex-col">
        <div className="shrink-0">{rightHeader}</div>

        <div className="relative min-h-0 lg:flex-1">
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 hidden h-4 lg:block"
            style={{
              background:
                "linear-gradient(to top, var(--ui-fade-from), rgba(0,0,0,0))",
            }}
          />
          <div
            className="no-scrollbar lg:h-full lg:overflow-y-auto lg:pb-4"
            data-settings-history-scroll
            style={
              {
                "--settings-history-sticky-row": "2.5rem",
              } as React.CSSProperties
            }
          >
            {rightContent}
          </div>
        </div>
      </div>
    </section>
  );
}
