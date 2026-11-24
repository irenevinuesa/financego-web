import { BASE_PATH } from "@/lib/base-path";

/**
 * "/" sends visitors to their language: Spanish browsers to /es/, everyone else to /en/.
 * The host can do this server-side too (vercel.json); this page is the fallback.
 */
export default function RootRedirect() {
  const en = `${BASE_PATH}/en/`;
  const es = `${BASE_PATH}/es/`;
  const script = `(function(){var l=(navigator.languages&&navigator.languages[0])||navigator.language||"";location.replace(/^es\\b/i.test(l)?${JSON.stringify(es)}:${JSON.stringify(en)});})();`;
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: script }} />
      <noscript>
        <meta httpEquiv="refresh" content={`0; url=${en}`} />
      </noscript>
      <main style={{ maxWidth: 480, margin: "20vh auto", padding: 24, textAlign: "center" }}>
        <p style={{ fontSize: 28, margin: 0 }}>FinanceGo</p>
        <p>
          <a href={en} style={{ color: "#114779" }}>
            English
          </a>{" "}
          ·{" "}
          <a href={es} style={{ color: "#114779" }}>
            Español
          </a>
        </p>
      </main>
    </>
  );
}
