"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Select, Input } from "@/components/ui/Field";
import type { SimpleCategory } from "@/types";

export function CategorySelect({
  endpoint,
  value,
  onChange,
  label,
}: {
  endpoint: string;
  value: string;
  onChange: (id: string) => void;
  label: string;
}) {
  const { token } = useAuth();
  const [categories, setCategories] = useState<SimpleCategory[]>([]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const load = () => {
    if (!token) return;
    api.get<SimpleCategory[]>(endpoint, token).then(setCategories);
  };

  useEffect(load, [token, endpoint]);

  const addCategory = async () => {
    if (!token || !newName.trim()) return;
    const category = await api.post<SimpleCategory>(endpoint, { name: newName.trim() }, token);
    setNewName("");
    setAdding(false);
    load();
    onChange(String(category.id));
  };

  return (
    <div>
      <label className="text-sm font-medium text-peci-dark">{label}</label>
      <div className="mt-1.5 flex gap-2">
        <Select value={value} onChange={(e) => onChange(e.target.value)} className="flex-1">
          <option value="">Sélectionner</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl border border-peci-teal/40 text-peci-teal transition-colors hover:bg-peci-teal/5"
          aria-label="Ajouter une catégorie"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {adding && (
        <div className="mt-2 flex gap-2">
          <Input
            placeholder="Nom de la nouvelle catégorie"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button
            type="button"
            onClick={addCategory}
            className="shrink-0 rounded-xl bg-peci-teal px-4 text-sm font-medium text-white"
          >
            Ajouter
          </button>
        </div>
      )}
    </div>
  );
}
