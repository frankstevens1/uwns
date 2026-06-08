export type LegalDocumentSlug = "privacy" | "terms";

export type LegalSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LegalDocument = {
  slug: LegalDocumentSlug;
  title: string;
  summary: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
};

const LAST_UPDATED = "2026-06-05";

export const legalDocumentOrder = ["privacy", "terms"] as const;

export const legalDocuments: Record<LegalDocumentSlug, LegalDocument> = {
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    summary:
      "How the web app, native app, and API handle accounts, sessions, activity history, and notifications.",
    lastUpdated: LAST_UPDATED,
    intro:
      "This policy describes the data the current UWNS implementation collects, how it is used, and which third-party services process it.",
    sections: [
      {
        title: "What we collect",
        paragraphs: [
          "When you create an account or sign in, we process the email address you provide, the password or one-time code you choose to use, and the Supabase session required to keep you signed in.",
          "The product also stores account and activity records that you create or trigger in the app, plus notification preferences and delivery records when notifications are used.",
        ],
        bullets: [
          "account email and user ID",
          "access and refresh tokens or equivalent session state",
          "action events such as sign-in, account views, settings views, and timer activity",
          "notification records, titles, bodies, links, metadata, and read state",
          "notification preferences and delivery attempts",
          "Expo push tokens and optional device IDs on native",
          "small amounts of browser-only UI state such as theme preference and recent command palette items",
        ],
      },
      {
        title: "How we use this data",
        paragraphs: [
          "We use this information to authenticate you, keep your session active, power account and notification features, show recent activity, and keep the app synchronized across web and native.",
          "We also use it to debug, audit, deduplicate records, and improve the service. Internal action history is part of the product, not a third-party ad or marketing analytics system.",
        ],
        bullets: [
          "sign you in and manage your session",
          "show recent actions and notification history",
          "deliver in-app, email, or push notifications based on your settings",
          "sync changes in realtime across clients",
          "investigate errors, duplicates, and delivery failures",
          "we do not sell personal information",
        ],
      },
      {
        title: "Authentication and security",
        paragraphs: [
          "On web, the Supabase browser client uses the auth cookies and tokens needed to sign you in, keep you signed in, manage your session, and protect account access. On native, the Supabase session is stored on the device with AsyncStorage.",
          "The API does not accept unauthenticated activity writes. It verifies the Supabase bearer token before writing actions or notifications to the database.",
          "We do not store your password in our own database. Supabase Auth handles the credential exchange and session issuance.",
        ],
      },
      {
        title: "Product activity and internal analytics",
        paragraphs: [
          "The app records internal action events in the actions table. Current examples include home_viewed, account_viewed, actions_viewed, notifications_viewed, docs_viewed, timer_started, timer_stopped, logged_in, signed_up, signed_out, password_updated, and demo_action_triggered.",
          "Some actions include metadata and unique keys so the service can deduplicate repeated events and link actions to notifications.",
          "This is internal product analytics used to run and improve the service. We do not use it for advertising, cross-site tracking, marketing profiles, or data brokerage.",
        ],
      },
      {
        title: "Notifications",
        paragraphs: [
          "We store notification records, notification preferences, push tokens, and delivery attempts in Supabase so the app can show history and manage delivery channels.",
          "Notifications can include a title, body, link, platform, group key, source action, read state, and metadata. Delivery attempts record the channel, provider, target, response, and any error so we can debug the pipeline.",
          "If you enable push on native, we register an Expo push token for that device. The current email delivery adapter logs delivery attempts in development instead of using a marketing email vendor in this codebase.",
        ],
      },
      {
        title: "Third-party services",
        paragraphs: [
          "The current implementation uses Supabase for authentication, database storage, realtime updates, and server-side session verification.",
          "It also uses Expo's push notification service for native push delivery and DiceBear to generate avatar images from a seed based on your user ID.",
          "We do not currently use third-party analytics, advertising, retargeting, or data brokerage services, and we do not place advertising or marketing pixels in the app.",
        ],
      },
      {
        title: "Your choices and retention",
        paragraphs: [
          "You can update notification preferences in the app, sign out, and contact us if you want to ask about access, correction, or deletion of data we control.",
          "We keep data while it is needed to run the service, support activity history and notifications, and meet security, operational, or legal needs. Backups and logs may persist for a limited period after active records are removed.",
        ],
      },
    ],
  },
  terms: {
    slug: "terms",
    title: "Terms of Service",
    summary:
      "The rules that apply to the web app, native app, account activity, notifications, and content you submit.",
    lastUpdated: LAST_UPDATED,
    intro:
      "These terms govern your use of the current UWNS implementation, including the web app, native app, API, and related notification and activity features.",
    sections: [
      {
        title: "Acceptance and updates",
        paragraphs: [
          "By using the service, you agree to these terms. If we update them, the version shown on the Legal page is the current one, and continued use after an update means you accept the new version.",
        ],
      },
      {
        title: "Account responsibilities",
        paragraphs: [
          "You are responsible for the information you provide, for keeping your email, password, one-time codes, and device access secure, and for activity that happens under your account.",
          "If you think someone else may have access to your account, you should sign out, reset your credentials, and contact us.",
        ],
        bullets: [
          "provide accurate account information",
          "keep your credentials and device access secure",
          "use your account only for your own authorized activity",
        ],
      },
      {
        title: "Acceptable use",
        paragraphs: [
          "You may use the service only for lawful purposes and in ways that do not interfere with the app, the API, other users, or third-party systems the product depends on.",
        ],
        bullets: [
          "do not misuse, probe, scrape, flood, or reverse engineer the service",
          "do not try to bypass authentication, row-level security, rate limits, or other access controls",
          "do not upload malware, spam, or harmful content",
          "do not impersonate other people or submit content you do not have the right to use",
        ],
      },
      {
        title: "User content and submitted data",
        paragraphs: [
          "You may submit content such as notification titles, bodies, links, action metadata, and preference choices. You keep the rights you already have in that content, but you give us the right to host, store, process, display, transmit, and modify it as needed to run the service, deliver notifications, and keep backups.",
          "You are responsible for making sure the content you submit is accurate and that you have the rights needed to use it in the service.",
        ],
      },
      {
        title: "Activity and notification features",
        paragraphs: [
          "The service records activity history and uses that activity to power product features such as notifications, unread counts, read state, and the recent activity screens in web and native.",
          "Notifications may be delivered in-app, by email, or by push depending on your settings and device support. Delivery is not guaranteed, and third-party systems or device settings can delay, block, or drop messages.",
        ],
      },
      {
        title: "Service availability and changes",
        paragraphs: [
          "This is an early-stage product. We may change, add, remove, suspend, or discontinue features at any time, with or without notice, and we do not promise uninterrupted or error-free service.",
        ],
      },
      {
        title: "Intellectual property",
        paragraphs: [
          "Except for the content you submit and any open-source components that carry their own licenses, the service, its design, branding, software, and related materials belong to us or our licensors.",
          "You may not copy, modify, distribute, or create derivative works from the service except as allowed by these terms or applicable open-source licenses.",
        ],
      },
      {
        title: "Termination and suspension",
        paragraphs: [
          "We may suspend or terminate access to the service if you violate these terms, create risk for the service or other users, or if we need to protect the product, the infrastructure, or our users.",
          "You may stop using the service at any time. We may retain data that is needed for backups, auditing, fraud prevention, security, or legal obligations.",
        ],
      },
      {
        title: "Disclaimer and limitation of liability",
        paragraphs: [
          "To the maximum extent allowed by law, the service is provided as is and as available, without warranties of any kind.",
          "To the maximum extent allowed by law, we are not liable for indirect, incidental, special, consequential, or punitive damages. Our total liability for any claim is limited to the greater of the amount you paid us for the service in the 12 months before the claim or $100 if you did not pay anything.",
        ],
      },
    ],
  },
};

export function getLegalDocumentSlug(
  value: string | string[] | undefined,
): LegalDocumentSlug {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "terms" ? "terms" : "privacy";
}

export function getLegalDocument(
  value: string | string[] | undefined,
): LegalDocument {
  return legalDocuments[getLegalDocumentSlug(value)];
}
