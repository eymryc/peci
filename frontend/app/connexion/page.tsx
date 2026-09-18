"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Loader2 } from "lucide-react";
import { FieldWrapper, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import { ApiRequestError } from "@/lib/api";

export default function ConnexionPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login(email, password);
      router.push(user.role === "member" ? "/espace-membre" : "/admin");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Connexion impossible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-peci-grey-light px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-black/5 bg-white p-8 shadow-sm sm:p-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-peci text-white">
          <LogIn className="h-6 w-6" />
        </div>
        <h1 className="font-display mt-5 text-2xl font-bold text-peci-dark">Connexion</h1>
        <p className="mt-1.5 text-sm text-peci-grey">Accédez à votre espace membre PECI.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <FieldWrapper label="Email" required>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </FieldWrapper>
          <FieldWrapper label="Mot de passe" required>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FieldWrapper>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <Link href="/mot-de-passe-oublie" className="text-peci-teal hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Se connecter
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-peci-grey">
          Vous cherchez à devenir membre ?{" "}
          <Link href="/devenir-membre" className="font-medium text-peci-teal hover:underline">
            Faire une demande d&apos;adhésion
          </Link>
        </p>
      </div>
    </div>
  );
}
