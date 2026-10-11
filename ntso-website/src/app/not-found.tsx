import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ButtonLink } from "@/components/ui/button";

export default function RootNotFound() {
  return (
    <>
      <Header />
      <main id="main" className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="font-display text-6xl font-extrabold text-electric-700">404</p>
        <h1 className="mt-4 text-3xl font-bold">Page not found</h1>
        <p className="mt-3 text-slate-600">The page you are looking for does not exist or has moved.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">Go to homepage</ButtonLink>
          <ButtonLink href="/contact" variant="outline">Contact us</ButtonLink>
        </div>
      </main>
      <Footer />
    </>
  );
}
