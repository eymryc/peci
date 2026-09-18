"use client";

import { useState } from "react";
import { CheckCircle2, Heart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldWrapper, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { api, ApiRequestError } from "@/lib/api";

const AMOUNTS = [5000, 10000, 25000, 50000];

const METHODS = [
  { value: "orange_money", label: "Orange Money" },
  { value: "mtn_money", label: "MTN Money" },
  { value: "moov_money", label: "Moov Money" },
  { value: "wave", label: "Wave" },
  { value: "card", label: "Carte bancaire" },
];

export function DonationForm() {
  const [amount, setAmount] = useState<number | null>(10000);
  const [customAmount, setCustomAmount] = useState("");
  const [method, setMethod] = useState(METHODS[0].value);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  const finalAmount = customAmount ? Number(customAmount) : amount ?? 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalAmount || finalAmount < 1000) {
      setError("Le montant minimum est de 1 000 FCFA.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<{ reference: string }>("/donations", {
        amount: finalAmount,
        method,
        name: anonymous ? undefined : name || undefined,
        email: email || undefined,
        is_anonymous: anonymous,
      });
      setReference(res.reference);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  if (reference) {
    return (
      <div className="rounded-2xl border border-peci-green/20 bg-white p-10 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-10 w-10 text-peci-green-dark" />
        <p className="mt-4 font-semibold text-peci-dark">Merci pour votre générosité !</p>
        <p className="mt-2 text-sm text-peci-grey">
          Votre intention de don (réf. {reference}) a été enregistrée. Le paiement en ligne
          n&apos;est pas encore activé — notre équipe vous contactera pour finaliser votre don.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-10">
      <div>
        <p className="text-sm font-medium text-peci-dark">Montant du don</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {AMOUNTS.map((value) => (
            <button
              type="button"
              key={value}
              onClick={() => {
                setAmount(value);
                setCustomAmount("");
              }}
              className={cn(
                "rounded-xl border px-4 py-3 text-sm font-semibold transition-colors",
                amount === value && !customAmount
                  ? "border-peci-teal bg-peci-teal/10 text-peci-teal"
                  : "border-black/10 text-peci-dark hover:border-peci-teal/50"
              )}
            >
              {value.toLocaleString("fr-FR")} FCFA
            </button>
          ))}
        </div>
        <div className="mt-3">
          <Input
            type="number"
            min={1000}
            placeholder="Montant libre (FCFA)"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setAmount(null);
            }}
          />
        </div>
      </div>

      <FieldWrapper label="Méthode de paiement souhaitée">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {METHODS.map((m) => (
            <button
              type="button"
              key={m.value}
              onClick={() => setMethod(m.value)}
              className={cn(
                "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                method === m.value
                  ? "border-peci-teal bg-peci-teal/10 text-peci-teal"
                  : "border-black/10 text-peci-grey hover:border-peci-teal/40"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </FieldWrapper>

      <div className="grid gap-5 sm:grid-cols-2">
        <FieldWrapper label="Nom">
          <Input value={name} onChange={(e) => setName(e.target.value)} disabled={anonymous} />
        </FieldWrapper>
        <FieldWrapper label="Email">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FieldWrapper>
      </div>

      <label className="flex items-center gap-2 text-sm text-peci-grey">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-black/20 text-peci-teal"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
        />
        Faire un don anonyme
      </label>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <Button type="submit" variant="donate" size="lg" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />}
        Faire un don de {finalAmount ? finalAmount.toLocaleString("fr-FR") : 0} FCFA
      </Button>

      <p className="text-center text-xs text-peci-grey">
        Le paiement en ligne (Mobile Money, carte) sera activé prochainement. Votre intention de
        don est enregistrée dès maintenant.
      </p>
    </form>
  );
}
