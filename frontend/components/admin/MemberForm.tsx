"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, UploadCloud } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, formatApiErrorMessage } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { FieldWrapper, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import type { Member, MembershipType } from "@/types";

const STATUS_OPTIONS: { value: Member["status"]; label: string }[] = [
  { value: "pending", label: "En attente" },
  { value: "under_review", label: "En vérification" },
  { value: "approved", label: "Actif" },
  { value: "rejected", label: "Refusé" },
  { value: "suspended", label: "Suspendu" },
  { value: "expired", label: "Expiré" },
];

export function MemberForm({ member }: { member?: Member }) {
  const { token } = useAuth();
  const { push } = useToast();
  const router = useRouter();
  const [membershipTypes, setMembershipTypes] = useState<MembershipType[]>([]);
  const [form, setForm] = useState({
    nom: member?.nom ?? "",
    prenoms: member?.prenoms ?? "",
    date_naissance: member?.date_naissance ?? "",
    sexe: member?.sexe ?? "",
    telephone: member?.telephone ?? "",
    whatsapp: member?.whatsapp ?? "",
    email: member?.email ?? "",
    ville: member?.ville ?? "",
    commune: member?.commune ?? "",
    profession: member?.profession ?? "",
    membership_type_id: member?.membership_type?.id ? String(member.membership_type.id) : "",
    status: member?.status ?? "approved",
    password: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const selectedType = membershipTypes.find((t) => String(t.id) === form.membership_type_id);

  useEffect(() => {
    if (!token) return;
    api.get<MembershipType[]>("/admin/membership-types", token).then(setMembershipTypes);
  }, [token]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== "") formData.append(key, String(value));
    });
    if (photo) formData.append("photo", photo);

    try {
      if (member) {
        await api.putForm(`/admin/members/${member.id}`, formData, token);
        push("Membre mis à jour avec succès.");
        router.refresh();
      } else {
        const created = await api.postForm<Member>("/admin/members", formData, token);
        push("Membre créé avec succès.");
        router.push(`/admin/membres/${created.id}`);
      }
    } catch (err) {
      push(formatApiErrorMessage(err, "Erreur lors de l'enregistrement."), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldWrapper label="Nom" required>
          <Input required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
        </FieldWrapper>
        <FieldWrapper label="Prénoms" required>
          <Input required value={form.prenoms} onChange={(e) => setForm({ ...form, prenoms: e.target.value })} />
        </FieldWrapper>
        <FieldWrapper label="Date de naissance">
          <Input type="date" value={form.date_naissance} onChange={(e) => setForm({ ...form, date_naissance: e.target.value })} />
        </FieldWrapper>
        <FieldWrapper label="Sexe">
          <Select value={form.sexe} onChange={(e) => setForm({ ...form, sexe: e.target.value as "M" | "F" | "" })}>
            <option value="">Non précisé</option>
            <option value="F">Féminin</option>
            <option value="M">Masculin</option>
          </Select>
        </FieldWrapper>
        <FieldWrapper label="Téléphone" required>
          <Input required value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
        </FieldWrapper>
        <FieldWrapper label="WhatsApp">
          <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
        </FieldWrapper>
        <FieldWrapper label="Email" required>
          <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </FieldWrapper>
        <FieldWrapper
          label="Type de membre"
          hint="Détermine le droit d'adhésion à régler."
        >
          <Select value={form.membership_type_id} onChange={(e) => setForm({ ...form, membership_type_id: e.target.value })}>
            <option value="">Sélectionner</option>
            {membershipTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name} — adhésion {type.adhesion_fee > 0 ? formatCurrency(type.adhesion_fee) : "gratuite"}, cotisation{" "}
                {type.cotisation_fee > 0 ? `${formatCurrency(type.cotisation_fee)}/mois` : "gratuite"}
              </option>
            ))}
          </Select>
        </FieldWrapper>
        <FieldWrapper label="Ville">
          <Input value={form.ville} onChange={(e) => setForm({ ...form, ville: e.target.value })} />
        </FieldWrapper>
        <FieldWrapper label="Commune">
          <Input value={form.commune} onChange={(e) => setForm({ ...form, commune: e.target.value })} />
        </FieldWrapper>
        <FieldWrapper label="Profession" className="sm:col-span-2">
          <Input value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })} />
        </FieldWrapper>
      </div>

      <FieldWrapper
        label="Photo d'identité"
        hint={
          member?.has_photo
            ? "Laisser vide pour conserver la photo actuelle."
            : selectedType?.card_eligible === false
              ? undefined
              : "Utilisée sur la carte de membre."
        }
      >
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-peci-teal/40 bg-peci-grey-light px-4 py-4 text-sm text-peci-grey transition-colors hover:bg-peci-teal/5">
          <UploadCloud className="h-5 w-5 text-peci-teal" />
          {photo ? photo.name : "Choisir une photo"}
          <input
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
          />
        </label>
      </FieldWrapper>

      <div className="grid gap-5 sm:grid-cols-2">
        <FieldWrapper
          label="Statut"
          hint={
            form.status === "approved"
              ? selectedType?.card_eligible === false
                ? "Ce type de membre reçoit un certificat d'adhésion, pas de carte."
                : "Une carte de membre sera générée automatiquement."
              : undefined
          }
        >
          <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Member["status"] })}>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </FieldWrapper>
        <FieldWrapper
          label="Mot de passe"
          hint={member ? "Laisser vide pour ne pas changer le mot de passe." : "Laisser vide pour générer un mot de passe aléatoire (le membre pourra le réinitialiser via « mot de passe oublié »)."}
        >
          <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </FieldWrapper>
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Enregistrer
      </Button>
    </form>
  );
}
