import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy Policy" updated="17 October 2026">
      <p>
        This policy describes how the FinanceGo MVP (Version 1) handles information. In short: <strong>your learning data stays in your browser</strong>.
      </p>
      <h2>What is stored, and where</h2>
      <ul>
        <li>Lesson completions, practice answers (results only), assessment scores, study time, mock-interview scores, applications, goals, checklist ticks and an optional first name.</li>
        <li>All of this is stored in your browser&apos;s local storage on your device. It is not sent to FinanceGo or anyone else.</li>
        <li>Text you write in the Interview Simulator is used on the page to give feedback and is not saved; only the scores and topics are kept.</li>
      </ul>
      <h2>What FinanceGo does not do</h2>
      <ul>
        <li>No accounts, no cookies for tracking, no analytics and no advertising.</li>
        <li>No live data requests about you; fonts are served with the site.</li>
      </ul>
      <h2>Your controls</h2>
      <ul>
        <li>
          Export, import or permanently delete all your data in{" "}
          <Link href="/settings/" className="text-electric hover:underline">
            Settings
          </Link>
          .
        </li>
        <li>Clearing your browser&apos;s site data also deletes it.</li>
      </ul>
      <h2>Future versions</h2>
      <p>
        Version 2 plans optional accounts with server-side storage. Before that launches, this policy will be updated to explain what is stored, where, for how long, the
        safeguards used (including per-user access controls) and how to delete your account.
      </p>
    </LegalPage>
  );
}
