"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { useMember } from "@/lib/use-member";
import { useAuth } from "@/lib/auth-context";
import { PageLoading } from "@/components/ui/Loading";
import { FieldWrapper, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { api, ApiRequestError } from "@/lib/api";
import type { Member } from "@/types";

export default function ProfilPage() {
  const { member, loading, error, reload } = useMember();

  if (loading) return <PageLoading />;
  if (error || !member) return <p className="text-sm text-red-600">{error}</p>;

  return <ProfilForm key={member.id} member={member} onSaved={reload} />;
}

function ProfilForm({ member, onSaved }: { member: Member; onSaved: () => void }) {
  const { token } = useAuth();
  const { push } = useToast();
  const [form, setForm] = useState(member);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      await api.put(
        "/member/profile",
        {
          nom: form.nom,
          prenoms: form.prenoms,
          telephone: form.telephone,
          whatsapp: form.whatsapp,
          ville: form.ville,
          commune: form.commune,
          profession: form.profession,
        },
        token
      );
      push("Profil mis à jour avec succès.");
      onSaved();
    } catch (err) {
      push(err instanceof ApiRequestError ? err.message : "Erreur lors de la mise à jour.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-peci-dark">Mon profil</h1>

      <form
        onSubmit={onSubmit}
        className="grid gap-5 rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-10"
      >
        <FieldWrapper label="Nom">
          <Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
        </FieldWrapper>
        <FieldWrapper label="Prénoms">
          <Input value={form.prenoms} onChange={(e) => setForm({ ...form, prenoms: e.target.value })} />
        </FieldWrapper>
        <FieldWrapper label="Téléphone">
          <Input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
        </FieldWrapper>
        <FieldWrapper label="WhatsApp">
          <Input value={form.whatsapp ?? ""} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
        </FieldWrapper>
        <FieldWrapper label="Email">
          <Input value={form.email} disabled />
        </FieldWrapper>
        <FieldWrapper label="Ville">
          <Input value={form.ville ?? ""} onChange={(e) => setForm({ ...form, ville: e.target.value })} />
        </FieldWrapper>
        <FieldWrapper label="Commune">
          <Input value={form.commune ?? ""} onChange={(e) => setForm({ ...form, commune: e.target.value })} />
        </FieldWrapper>
        <FieldWrapper label="Profession">
          <Input value={form.profession ?? ""} onChange={(e) => setForm({ ...form, profession: e.target.value })} />
        </FieldWrapper>

        <div className="sm:col-span-2">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Enregistrer les modifications
          </Button>
        </div>
      </form>
    </div>
  );
}
