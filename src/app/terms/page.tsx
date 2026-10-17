import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms of Use" updated="17 October 2026">
      <p>By using FinanceGo you agree to these terms. If you do not agree, please do not use the site.</p>
      <h2>Educational purpose</h2>
      <p>
        FinanceGo provides general financial education and interview preparation. It is not investment, legal, tax, accounting or career advice. See the{" "}
        <Link href="/disclaimer/" className="text-electric hover:underline">
          educational disclaimer
        </Link>
        .
      </p>
      <h2>Accuracy</h2>
      <p>
        We work to keep content accurate and test our formulas, but we cannot guarantee that every explanation, example or calculation is free of errors or suitable for your
        situation. Calculator outputs depend entirely on the inputs you provide.
      </p>
      <h2>Your data</h2>
      <p>Your progress is stored locally in your browser. You are responsible for backing it up; FinanceGo cannot recover data deleted from your browser.</p>
      <h2>Acceptable use</h2>
      <ul>
        <li>Use FinanceGo for personal learning and preparation.</li>
        <li>Do not attempt to disrupt the site or misrepresent FinanceGo content as professional advice.</li>
      </ul>
      <h2>Content</h2>
      <p>Lessons, questions, interview scripts, tools and artwork are FinanceGo&apos;s own work. Please do not republish them without permission.</p>
      <h2>No warranty</h2>
      <p>The MVP is provided “as is”, without warranties of any kind, to the extent permitted by law.</p>
    </LegalPage>
  );
}
