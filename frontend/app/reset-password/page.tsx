"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Loader2 } from "lucide-react";
import { FieldWrapper, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { api, ApiRequestError } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/auth/reset-password", {
        token: params.get("token") ?? "",
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      router.push("/connexion");
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
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="font-display mt-5 text-2xl font-bold text-peci-dark">
          Réinitialiser le mot de passe
        </h1>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <FieldWrapper label="Email" required>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </FieldWrapper>
          <FieldWrapper label="Nouveau mot de passe" required>
            <Input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FieldWrapper>
          <FieldWrapper label="Confirmation" required>
            <Input
              type="password"
              required
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
            />
          </FieldWrapper>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Réinitialiser
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-peci-grey">
          <Link href="/connexion" className="font-medium text-peci-teal hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
