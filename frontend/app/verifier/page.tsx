"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Search } from "lucide-react";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function VerifierLandingPage() {
  const router = useRouter();
  const [value, setValue] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) router.push(`/verifier/${encodeURIComponent(value.trim())}`);
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-peci-grey-light px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-black/5 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl gradient-peci text-white">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h1 className="font-display mt-5 text-2xl font-bold text-peci-dark">
          Vérifier une carte de membre
        </h1>
        <p className="mt-2 text-sm text-peci-grey">
          Saisissez le numéro de membre indiqué sur la carte (ex. PECI-2026-000001).
        </p>

        <form onSubmit={onSubmit} className="mt-8 flex gap-2">
          <Input
            placeholder="PECI-2026-000001"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Button type="submit" size="md">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
