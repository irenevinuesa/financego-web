import { Cover } from "@/components/art/Cover";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="container-page grid items-center gap-10 py-16 lg:grid-cols-2">
      <div>
        <p className="eyebrow mb-3">404</p>
        <h1 className="font-serif text-5xl">Off the trail.</h1>
        <p className="mt-4 text-lg text-ink-muted">This page does not exist, or it has moved. Let&apos;s get you back on the path.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/">Home</ButtonLink>
          <ButtonLink href="/search/" variant="secondary">
            Search FinanceGo
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
