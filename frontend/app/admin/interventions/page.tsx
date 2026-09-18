"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Lock, Plus, Save, Trash2, MapPin } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, formatApiErrorMessage } from "@/lib/api";
import { PageLoading } from "@/components/ui/Loading";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { InterventionCity } from "@/types";

export default function AdminInterventionsPage() {
  const { token } = useAuth();
  const { push } = useToast();
  const [cities, setCities] = useState<InterventionCity[] | null>(null);
  const [savingId, setSavingId] = useState<number | "new" | null>(null);
  const [newName, setNewName] = useState("");
  const [showNew, setShowNew] = useState(false);

  const load = () => {
    if (!token) return;
    api.get<InterventionCity[]>("/admin/intervention-cities", token).then(setCities);
  };

  useEffect(load, [token]);

  const updateField = (id: number, field: keyof InterventionCity, value: string | number | boolean) => {
    setCities((prev) => prev?.map((c) => (c.id === id ? { ...c, [field]: value } : c)) ?? null);
  };

  const saveCity = async (city: InterventionCity) => {
    if (!token) return;
    setSavingId(city.id);
    try {
      await api.put(
        `/admin/intervention-cities/${city.id}`,
        { name: city.name, order: Number(city.order), is_active: city.is_active },
        token
      );
      push(`Ville « ${city.name} » enregistrée.`);
    } catch (err) {
      push(formatApiErrorMessage(err, "Erreur lors de l'enregistrement."), "error");
    } finally {
      setSavingId(null);
    }
  };

  const removeCity = async (city: InterventionCity) => {
    if (!token || !confirm(`Supprimer « ${city.name} » de la liste des interventions ?`)) return;
    try {
      await api.delete(`/admin/intervention-cities/${city.id}`, token);
      push("Ville supprimée.");
      load();
    } catch (err) {
      push(formatApiErrorMessage(err, "Erreur lors de la suppression."), "error");
    }
  };

  const createCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newName.trim()) return;
    setSavingId("new");
    try {
      await api.post("/admin/intervention-cities", { name: newName.trim() }, token);
      push("Ville ajoutée.");
      setNewName("");
      setShowNew(false);
      load();
    } catch (err) {
      push(formatApiErrorMessage(err, "Erreur lors de la création."), "error");
    } finally {
      setSavingId(null);
    }
  };

  if (!cities) return <PageLoading />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-peci-dark">Interventions</h1>
          <p className="mt-1 text-sm text-peci-grey">
            Villes affichées dans la section « Nos interventions en Côte d&apos;Ivoire » de la page
            d&apos;accueil. Le nombre de projets et de bénéficiaires est calculé automatiquement à
            partir des projets associés à chaque ville (champ « Bénéficiaires » dans{" "}
            <Link href="/admin/projets" className="text-peci-teal hover:underline">
              Projets
            </Link>
            ) — pas de saisie manuelle ici, pour éviter tout écart avec les vrais chiffres.
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={() => setShowNew((v) => !v)}>
          <Plus className="h-4 w-4" />
          Nouvelle ville
        </Button>
      </div>

      {showNew && (
        <form onSubmit={createCity} className="flex flex-wrap gap-3 rounded-2xl border border-dashed border-peci-teal/30 bg-white p-4">
          <Input
            placeholder="Nom de la ville (ex. Korhogo)"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="max-w-xs"
          />
          <Button type="submit" size="sm" disabled={savingId === "new"}>
            {savingId === "new" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ajouter"}
          </Button>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-sm">
        {cities.length === 0 ? (
          <div className="p-10 text-center">
            <MapPin className="mx-auto h-8 w-8 text-peci-grey" />
            <p className="mt-3 text-sm text-peci-grey">Aucune ville enregistrée.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/5 text-xs uppercase text-peci-grey">
              <tr>
                <th className="px-6 py-4">Ville</th>
                <th className="px-6 py-4">Ordre</th>
                <th className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5" title="Calculé automatiquement, non modifiable ici">
                    Projets <Lock className="h-3 w-3" />
                  </span>
                </th>
                <th className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5" title="Calculé automatiquement, non modifiable ici">
                    Bénéficiaires <Lock className="h-3 w-3" />
                  </span>
                </th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cities.map((city) => (
                <tr key={city.id} className="border-b border-black/5 last:border-0">
                  <td className="px-6 py-3">
                    <Input value={city.name} onChange={(e) => updateField(city.id, "name", e.target.value)} className="min-w-[180px]" />
                  </td>
                  <td className="px-6 py-3">
                    <Input
                      type="number"
                      min={0}
                      value={city.order}
                      onChange={(e) => updateField(city.id, "order", Number(e.target.value))}
                      className="w-20"
                    />
                  </td>
                  <td className="px-6 py-3 text-peci-grey" title="Calculé automatiquement depuis les projets — voir Projets">
                    {city.projects_count}
                  </td>
                  <td className="px-6 py-3 text-peci-grey" title="Calculé automatiquement depuis les projets — voir Projets">
                    {city.beneficiaries_count}
                  </td>
                  <td className="px-6 py-3">
                    <Select
                      value={city.is_active ? "1" : "0"}
                      onChange={(e) => updateField(city.id, "is_active", e.target.value === "1")}
                      className="w-32"
                    >
                      <option value="1">Visible</option>
                      <option value="0">Masquée</option>
                    </Select>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => saveCity(city)}
                        disabled={savingId === city.id}
                        className="text-peci-teal hover:underline"
                        aria-label={`Enregistrer ${city.name}`}
                      >
                        {savingId === city.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCity(city)}
                        className="text-red-500 hover:underline"
                        aria-label={`Supprimer ${city.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
