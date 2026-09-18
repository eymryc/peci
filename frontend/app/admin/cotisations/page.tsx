"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, formatApiErrorMessage } from "@/lib/api";
import { PageLoading } from "@/components/ui/Loading";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { MembershipType } from "@/types";

export default function AdminCotisationsPage() {
  const { token, user } = useAuth();
  const { push } = useToast();
  const [types, setTypes] = useState<MembershipType[] | null>(null);
  const [savingId, setSavingId] = useState<number | "new" | null>(null);
  const [newType, setNewType] = useState({
    name: "",
    description: "",
    adhesion_fee: "0",
    cotisation_fee: "0",
    merchandise_items: "",
    card_eligible: true,
  });
  const [showNew, setShowNew] = useState(false);

  const load = () => {
    if (!token) return;
    api.get<MembershipType[]>("/admin/membership-types", token).then(setTypes);
  };

  useEffect(load, [token]);

  if (user && user.role !== "admin") {
    return (
      <div className="rounded-2xl border border-dashed border-peci-teal/30 bg-white p-10 text-center">
        <p className="text-sm text-peci-grey">Cette section est réservée aux administrateurs.</p>
      </div>
    );
  }

  const updateField = (id: number, field: keyof MembershipType, value: string | boolean) => {
    setTypes((prev) => prev?.map((t) => (t.id === id ? { ...t, [field]: value } : t)) ?? null);
  };

  const saveType = async (type: MembershipType) => {
    if (!token) return;
    setSavingId(type.id);
    try {
      await api.put(
        `/admin/membership-types/${type.id}`,
        {
          name: type.name,
          description: type.description ?? "",
          adhesion_fee: Number(type.adhesion_fee),
          cotisation_fee: Number(type.cotisation_fee),
          merchandise_items: type.merchandise_items ?? "",
          card_eligible: type.card_eligible,
          is_active: type.is_active,
        },
        token
      );
      push(`Type « ${type.name} » enregistré.`);
    } catch (err) {
      push(formatApiErrorMessage(err, "Erreur lors de l'enregistrement."), "error");
    } finally {
      setSavingId(null);
    }
  };

  const removeType = async (type: MembershipType) => {
    if (!token || !confirm(`Supprimer le type « ${type.name} » ?`)) return;
    try {
      await api.delete(`/admin/membership-types/${type.id}`, token);
      push("Type supprimé.");
      load();
    } catch (err) {
      push(formatApiErrorMessage(err, "Erreur lors de la suppression."), "error");
    }
  };

  const createType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSavingId("new");
    try {
      await api.post(
        "/admin/membership-types",
        {
          name: newType.name,
          description: newType.description,
          adhesion_fee: Number(newType.adhesion_fee) || 0,
          cotisation_fee: Number(newType.cotisation_fee) || 0,
          merchandise_items: newType.merchandise_items,
          card_eligible: newType.card_eligible,
        },
        token
      );
      push("Type d'adhésion créé.");
      setNewType({
        name: "",
        description: "",
        adhesion_fee: "0",
        cotisation_fee: "0",
        merchandise_items: "",
        card_eligible: true,
      });
      setShowNew(false);
      load();
    } catch (err) {
      push(formatApiErrorMessage(err, "Erreur lors de la création."), "error");
    } finally {
      setSavingId(null);
    }
  };

  if (!types) return <PageLoading />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-peci-dark">Cotisations &amp; types de membres</h1>
          <p className="mt-1 text-sm text-peci-grey">
            Le droit d&apos;adhésion (à régler une fois) et la cotisation mensuelle dépendent tous
            les deux du type de membre choisi lors de l&apos;inscription. La carte de membre et le
            kit remis par le bureau (casquette, tee-shirt...) sont réservés aux types « Droit à la
            carte » — les autres (bénévoles, élèves, membres honoraires) reçoivent uniquement un
            certificat d&apos;adhésion dans leur espace membre, sans kit.
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={() => setShowNew((v) => !v)}>
          <Plus className="h-4 w-4" />
          Nouveau type
        </Button>
      </div>

      {showNew && (
        <form
          onSubmit={createType}
          className="grid gap-3 rounded-2xl border border-dashed border-peci-teal/30 bg-white p-4 sm:grid-cols-4"
        >
          <Input
            placeholder="Nom (ex. Membre étudiant)"
            required
            value={newType.name}
            onChange={(e) => setNewType({ ...newType, name: e.target.value })}
          />
          <Input
            placeholder="Description (optionnel)"
            value={newType.description}
            onChange={(e) => setNewType({ ...newType, description: e.target.value })}
          />
          <Input
            type="number"
            min={0}
            placeholder="Droit d'adhésion"
            value={newType.adhesion_fee}
            onChange={(e) => setNewType({ ...newType, adhesion_fee: e.target.value })}
          />
          <Input
            type="number"
            min={0}
            placeholder="Cotisation / mois"
            value={newType.cotisation_fee}
            onChange={(e) => setNewType({ ...newType, cotisation_fee: e.target.value })}
          />
          <Textarea
            placeholder={
              newType.card_eligible
                ? "Kit remis à l'adhésion, un article par ligne (ex. Carte de membre / Casquette / T-shirt)"
                : "Pas de kit pour un type sans droit à la carte"
            }
            rows={2}
            disabled={!newType.card_eligible}
            className="min-h-0 disabled:cursor-not-allowed disabled:bg-peci-grey-light disabled:text-peci-grey sm:col-span-2"
            value={newType.card_eligible ? newType.merchandise_items : ""}
            onChange={(e) => setNewType({ ...newType, merchandise_items: e.target.value })}
          />
          <Select
            value={newType.card_eligible ? "1" : "0"}
            onChange={(e) => {
              const cardEligible = e.target.value === "1";
              setNewType({ ...newType, card_eligible: cardEligible, merchandise_items: cardEligible ? newType.merchandise_items : "" });
            }}
          >
            <option value="1">Droit à la carte</option>
            <option value="0">Certificat (pas de carte)</option>
          </Select>
          <Button type="submit" size="sm" disabled={savingId === "new"} className="self-start">
            {savingId === "new" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer"}
          </Button>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 text-xs uppercase text-peci-grey">
            <tr>
              <th className="px-6 py-4">Type de membre</th>
              <th className="px-6 py-4">Droit d&apos;adhésion (FCFA)</th>
              <th className="px-6 py-4">Cotisation / mois (FCFA)</th>
              <th className="px-6 py-4">Kit remis (un article par ligne)</th>
              <th className="px-6 py-4">Carte / certificat</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {types.map((type) => (
              <tr key={type.id} className="border-b border-black/5 last:border-0">
                <td className="px-6 py-3">
                  <Input value={type.name} onChange={(e) => updateField(type.id, "name", e.target.value)} className="min-w-[160px]" />
                </td>
                <td className="px-6 py-3">
                  <Input
                    type="number"
                    min={0}
                    value={type.adhesion_fee}
                    onChange={(e) => updateField(type.id, "adhesion_fee", e.target.value)}
                    className="w-32"
                  />
                </td>
                <td className="px-6 py-3">
                  <Input
                    type="number"
                    min={0}
                    value={type.cotisation_fee}
                    onChange={(e) => updateField(type.id, "cotisation_fee", e.target.value)}
                    className="w-32"
                  />
                </td>
                <td className="px-6 py-3">
                  <Textarea
                    value={type.card_eligible ? (type.merchandise_items ?? "") : ""}
                    onChange={(e) => updateField(type.id, "merchandise_items", e.target.value)}
                    rows={2}
                    disabled={!type.card_eligible}
                    className="min-h-0 min-w-[200px] disabled:cursor-not-allowed disabled:bg-peci-grey-light disabled:text-peci-grey"
                    placeholder={type.card_eligible ? "Carte de membre\nCasquette\nT-shirt" : "Pas de kit pour ce type"}
                  />
                </td>
                <td className="px-6 py-3">
                  <Select
                    value={type.card_eligible ? "1" : "0"}
                    onChange={(e) => {
                      const cardEligible = e.target.value === "1";
                      updateField(type.id, "card_eligible", cardEligible);
                      if (!cardEligible) updateField(type.id, "merchandise_items", "");
                    }}
                    className="w-40"
                  >
                    <option value="1">Droit à la carte</option>
                    <option value="0">Certificat</option>
                  </Select>
                </td>
                <td className="px-6 py-3">
                  <Select
                    value={type.is_active ? "1" : "0"}
                    onChange={(e) => updateField(type.id, "is_active", e.target.value === "1")}
                    className="w-28"
                  >
                    <option value="1">Actif</option>
                    <option value="0">Inactif</option>
                  </Select>
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => saveType(type)}
                      disabled={savingId === type.id}
                      className="text-peci-teal hover:underline"
                      aria-label={`Enregistrer ${type.name}`}
                    >
                      {savingId === type.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeType(type)}
                      disabled={(type.members_count ?? 0) > 0}
                      title={(type.members_count ?? 0) > 0 ? "Utilisé par des membres" : "Supprimer"}
                      className="text-red-500 hover:underline disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label={`Supprimer ${type.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
