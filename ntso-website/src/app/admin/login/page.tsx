import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/auth";
import { LogoMark } from "@/components/ui/logo";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getCurrentUser()) redirect("/admin");
  const { next } = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center bg-navy-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark className="h-12 w-12" />
          <h1 className="mt-4 text-2xl font-bold text-white">NTSO Admin</h1>
          <p className="mt-1 text-sm text-navy-300">Authorised staff only</p>
        </div>
        <div className="rounded-2xl bg-white p-7 shadow-lift">
          <LoginForm next={next} />
        </div>
      </div>
    </main>
  );
}
