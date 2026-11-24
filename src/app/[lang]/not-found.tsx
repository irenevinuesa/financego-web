import { Cover } from "@/components/art/Cover";
import { ButtonLink } from "@/components/ui/Button";
import { getLang } from "@/lib/server-lang";

const TEXT = {
  en: {
    title: "Off the trail.",
    body: "This page does not exist, or it has moved. Let's get you back on the path.",
    home: "Home",
    search: "Search FinanceGo",
  },
  es: {
    title: "Fuera de ruta.",
    body: "Esta página no existe o se ha movido. Volvamos al camino.",
    home: "Inicio",
    search: "Buscar en FinanceGo",
  },
};

export default async function NotFound() {
  const tx = TEXT[await getLang()];
  return (
    <div className="container-page grid items-center gap-10 py-16 lg:grid-cols-2">
      <div>
        <p className="eyebrow mb-3">404</p>
        <h1 className="font-serif text-5xl">{tx.title}</h1>
        <p className="mt-4 text-lg text-ink-muted">{tx.body}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/">{tx.home}</ButtonLink>
          <ButtonLink href="/search/" variant="secondary">
            {tx.search}
          </ButtonLink>
        </div>
      </div>
      <div className="h-64 overflow-hidden rounded-3xl shadow-lift">
        <Cover name="alps" className="h-full w-full">
          <span className="absolute inset-0 flex items-center justify-center font-serif text-8xl text-cream/90">404</span>
        </Cover>
      </div>
    </div>
  );
}
