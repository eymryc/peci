"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound, Loader2, CheckCircle2 } from "lucide-react";
import { FieldWrapper, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { api, ApiRequestError } from "@/lib/api";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-peci-grey-light px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-black/5 bg-white p-8 shadow-sm sm:p-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-peci text-white">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="font-display mt-5 text-2xl font-bold text-peci-dark">Mot de passe oublié</h1>
        <p className="mt-1.5 text-sm text-peci-grey">
          Indiquez votre email, nous vous enverrons un lien de réinitialisation.
        </p>

        {sent ? (
          <div className="mt-8 flex items-start gap-3 rounded-xl border border-peci-green/30 bg-peci-grey-light p-4 text-sm text-peci-dark">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-peci-green-dark" />
            Si cette adresse existe, un lien de réinitialisation vient de lui être envoyé.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <FieldWrapper label="Email" required>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </FieldWrapper>
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Envoyer le lien
            </Button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-peci-grey">
          <Link href="/connexion" className="font-medium text-peci-teal hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
