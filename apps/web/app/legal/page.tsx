import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal | df",
  description: "Privacy policy and terms for df.",
};

export default function LegalPage() {
  return (
    <section className="mx-auto max-w-3xl py-10 space-y-10 text-sm leading-6 text-(--ui-fg)">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Legal</h1>
        <p className="text-(--ui-muted-fg)">
          Privacy and terms for using this application. Replace this baseline copy
          with your production legal text before launch.
        </p>
      </div>

      <section id="privacy" className="scroll-mt-24 space-y-4">
        <div className="border-b border-(--ui-border) pb-2">
          <h2 className="text-lg font-semibold">Privacy</h2>
        </div>
        <p>
          We collect the information needed to provide the application, including
          account details, authentication data, and information you submit while
          using the product.
        </p>
        <p>
          We use this information to operate, secure, improve, and support the
          service. We do not sell personal information.
        </p>
        <p>
          Authentication and account data may be processed by infrastructure
          providers used to run the application. Access is limited to what is
          necessary to provide and maintain the service.
        </p>
        <p>
          To request access, correction, or deletion of your data, contact the
          address listed in the footer.
        </p>
      </section>

      <section id="terms" className="scroll-mt-24 space-y-4">
        <div className="border-b border-(--ui-border) pb-2">
          <h2 className="text-lg font-semibold">Terms</h2>
        </div>
        <p>
          By using this application, you agree to use it lawfully and not misuse,
          disrupt, reverse engineer, or interfere with the service.
        </p>
        <p>
          You are responsible for the accuracy of information you provide and for
          keeping your account access secure.
        </p>
        <p>
          The application is provided as is, without warranties to the maximum
          extent permitted by law. We may update, suspend, or discontinue parts
          of the service as needed.
        </p>
        <p>
          These terms may be updated over time. Continued use of the application
          after changes means you accept the updated terms.
        </p>
      </section>
    </section>
  );
}
