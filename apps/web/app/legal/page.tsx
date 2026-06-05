import type { Metadata } from "next";
import { LegalPageChrome } from "./LegalPageChrome";
import { getLegalDocument } from "./legalContent";

type SearchParams = Record<string, string | string[] | undefined>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
}): Promise<Metadata> {
  const resolvedSearchParams = await resolveSearchParams(searchParams);
  const document = getLegalDocument(resolvedSearchParams.document);

  return {
    title: `${document.title} | Legal | df`,
    description: document.summary,
  };
}

export default async function LegalPage({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
}) {
  const resolvedSearchParams = await resolveSearchParams(searchParams);
  const document = getLegalDocument(resolvedSearchParams.document);
  const lastUpdatedLabel = formatLegalDate(document.lastUpdated);

  return (
    <section
      className={[
        "mx-auto max-w-4xl px-4 py-10 text-sm leading-6 text-(--ui-fg)",
        "print:[--ui-bg:#fff] print:[--ui-panel:#fff] print:[--ui-subtle-bg:#f8fafc]",
        "print:[--ui-fg:#000] print:[--ui-muted-fg:#4b5563] print:[--ui-border:#d1d5db]",
        "print:py-0",
      ].join(" ")}
    >
      <LegalPageChrome
        document={document}
      />

      <article className="space-y-10 pt-8 print:pt-0">
        <header className="space-y-4">
          <div className="flex flex-col flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="text-3xl font-semibold tracking-tight">
              {document.title}
            </h2>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-(--ui-muted-fg)">
              Last updated {lastUpdatedLabel}
            </span>
          </div>

          <p className="max-w-3xl text-sm leading-6 text-(--ui-muted-fg)">
            {document.summary}
          </p>

          <p className="max-w-3xl text-sm leading-6 text-(--ui-fg)">
            {document.intro}
          </p>
        </header>

        <div className="space-y-8 border-t border-(--ui-border) pt-8">
          {document.sections.map((section) => (
            <section
              key={section.title}
              className="space-y-3 break-inside-avoid print:break-inside-avoid"
            >
              <h3 className="text-lg font-semibold tracking-tight">
                {section.title}
              </h3>

              <div className="space-y-3">
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="max-w-3xl text-sm leading-6 text-(--ui-fg)"
                  >
                    {paragraph}
                  </p>
                ))}

                {section.bullets?.length ? (
                  <ul className="space-y-2 pl-5 text-sm leading-6 text-(--ui-fg) [list-style:disc]">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="pl-1">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      </article>
    </section>
  );
}

function formatLegalDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

async function resolveSearchParams(
  searchParams?: SearchParams | Promise<SearchParams>,
) {
  return (await Promise.resolve(searchParams)) ?? {};
}
