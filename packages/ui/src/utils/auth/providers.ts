export type MailProvider = {
  id: string;
  label: string;
  match: (email: string) => boolean;
  mailboxUrl: string;
};

const domain = (email: string) => email.split("@")[1]?.toLowerCase() ?? "";

export const mailProviders: MailProvider[] = [
  {
    id: "gmail",
    label: "Gmail",
    match: (e) => ["gmail.com", "googlemail.com"].includes(domain(e)),
    mailboxUrl: "https://mail.google.com",
  },
  {
    id: "outlook",
    label: "Outlook",
    match: (e) => ["outlook.com", "hotmail.com", "live.com"].includes(domain(e)),
    mailboxUrl: "https://outlook.live.com/mail/",
  },
  {
    id: "icloud",
    label: "iCloud",
    match: (e) => ["icloud.com", "me.com", "mac.com"].includes(domain(e)),
    mailboxUrl: "https://www.icloud.com/mail",
  },
  {
    id: "yahoo",
    label: "Yahoo",
    match: (e) => ["yahoo.com", "yahoo.co.uk", "yahoo.fr", "ymail.com"].includes(domain(e)),
    mailboxUrl: "https://mail.yahoo.com",
  },
];

export function getMailboxUrl(email: string) {
  const provider = mailProviders.find((p) => p.match(email));
  return provider?.mailboxUrl ?? "mailto:";
}
