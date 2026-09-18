"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { FieldWrapper, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { api, ApiRequestError } from "@/lib/api";

const initial = { organization: "", contact_name: "", email: "", phone: "", message: "" };

export function PartnerInquiryForm() {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const set = (key: keyof typeof initial) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/partners/contact", form);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-peci-green/20 bg-peci-grey-light p-8 text-center">
        <CheckCircle2 className="mx-auto h-9 w-9 text-peci-green-dark" />
        <p className="mt-3 font-semibold text-peci-dark">Demande envoyée</p>
        <p className="mt-1 text-sm text-peci-grey">Notre équipe partenariats vous recontactera.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldWrapper label="Organisation" required>
          <Input required value={form.organization} onChange={set("organization")} />
        </FieldWrapper>
        <FieldWrapper label="Nom du contact" required>
          <Input required value={form.contact_name} onChange={set("contact_name")} />
        </FieldWrapper>
        <FieldWrapper label="Email" required>
          <Input type="email" required value={form.email} onChange={set("email")} />
        </FieldWrapper>
        <FieldWrapper label="Téléphone">
          <Input type="tel" value={form.phone} onChange={set("phone")} />
        </FieldWrapper>
      </div>
      <FieldWrapper label="Message" required>
        <Textarea required value={form.message} onChange={set("message")} />
      </FieldWrapper>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Envoyer la demande
      </Button>
    </form>
  );
}
