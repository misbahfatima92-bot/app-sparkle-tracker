import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Shield } from "lucide-react";
import { Background } from "@/components/Background";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — JobTrack" },
      { name: "description", content: "JobTrack Privacy Policy." },
    ],
  }),
});

function PrivacyPage() {
  return (
    <div className="relative min-h-screen">
      <Background />
      <div className="relative mx-auto max-w-3xl px-4 py-12 md:py-16">
        <div className="mb-8">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>

        <div className="glass p-8 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-xl bg-violet-500/15 border border-violet-500/30 p-2.5 text-violet-300">
              <Shield className="h-5 w-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-sm text-slate-400 mb-8">Last Updated: June 2, 2026</p>

          <div className="space-y-8">
            <Section number="1" title="Introduction">
              <p>
                This Privacy Policy describes how we collect, use, and protect user information when you use our application.
              </p>
              <p>
                By using this application, you agree to the collection and use of information in accordance with this policy.
              </p>
            </Section>

            <Section number="2" title="Information We Collect">
              <p>We only collect the minimum information required for authentication and basic app functionality.</p>
              <p>When you sign in using Google, we may collect:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li>Full Name</li>
                <li>Email Address</li>
                <li>Profile Picture (if provided by Google)</li>
                <li>Google User ID (for authentication purposes only)</li>
              </ul>
              <p>We do not collect any other personal data.</p>
            </Section>

            <Section number="3" title="How We Use Your Information">
              <p>We use the collected information strictly for the following purposes:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li>To authenticate and sign you into the application</li>
                <li>To create and manage your user account</li>
                <li>To provide access to app features</li>
                <li>To improve user experience within the application</li>
              </ul>
              <p>We do not use your data for advertising or marketing purposes.</p>
            </Section>

            <Section number="4" title="Data Sharing">
              <p>We do not sell, trade, or rent your personal information.</p>
              <p>We may share limited data only in the following cases:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li>When required by law or legal process</li>
                <li>To comply with regulatory obligations</li>
                <li>With trusted service providers that help operate the application (e.g., Supabase authentication services)</li>
              </ul>
            </Section>

            <Section number="5" title="Data Storage and Security">
              <p>We take reasonable technical and organizational measures to protect your information.</p>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li>Data is stored securely using Supabase authentication services</li>
                <li>Access is restricted to authorized systems only</li>
                <li>We do not store sensitive Google account data (like passwords, Gmail, Drive, etc.)</li>
              </ul>
            </Section>

            <Section number="6" title="Third-Party Services">
              <p>This application uses third-party services for authentication:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li>Google OAuth (for login)</li>
                <li>Supabase (for authentication and user management)</li>
              </ul>
              <p>These services have their own privacy policies which you are encouraged to review.</p>
            </Section>

            <Section number="7" title="Data Retention">
              <p>We retain your basic account information only as long as your account is active.</p>
              <p>You may request deletion of your account at any time.</p>
            </Section>

            <Section number="8" title="User Rights">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li>Access your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your account and data</li>
              </ul>
              <p>To request data deletion, please contact us at the email below.</p>
            </Section>

            <Section number="9" title="Children's Privacy">
              <p>This application is not intended for children under the age of 13.</p>
              <p>We do not knowingly collect personal data from children.</p>
            </Section>

            <Section number="10" title="Changes to This Policy">
              <p>We may update this Privacy Policy from time to time.</p>
              <p>Any changes will be posted on this page with an updated revision date.</p>
            </Section>

            <Section number="11" title="Contact Information">
              <p>If you have any questions about this Privacy Policy, you can contact us:</p>
              <p className="flex items-center gap-2 text-slate-300">
                <span>Email:</span>
                <a
                  href="mailto:mbmaryambashir1999@gmail.com"
                  className="text-violet-400 hover:text-violet-300 underline underline-offset-4"
                >
                  mbmaryambashir1999@gmail.com
                </a>
              </p>
            </Section>
          </div>
        </div>

        <footer className="mt-10 text-center text-xs text-slate-500">
          <Link to="/login" className="hover:text-slate-300 transition-colors">
            Back to login
          </Link>
        </footer>
      </div>
    </div>
  );
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-100 mb-2">
        {number}. {title}
      </h2>
      <div className="space-y-2 text-sm text-slate-400 leading-relaxed">{children}</div>
    </section>
  );
}
