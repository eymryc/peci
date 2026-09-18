"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Award, Download } from "lucide-react";
import { useMember } from "@/lib/use-member";
import { useAuth } from "@/lib/auth-context";
import { PageLoading } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import { downloadWithAuth } from "@/lib/api";

export default function CertificatPage() {
  const { member, loading, error } = useMember();
  const { token } = useAuth();
  const [downloading, setDownloading] = useState(false);

  if (loading) return <PageLoading />;
  if (error || !member) return <p className="text-sm text-red-600">{error}</p>;

  if (member.membership_type?.card_eligible !== false) {
    return (
      <div className="rounded-2xl border border-dashed border-peci-teal/30 bg-white p-10 text-center">
        <p className="text-sm text-peci-grey">
          Aucun certificat n&apos;est disponible pour votre type de membre.
        </p>
      </div>
    );
  }

  if (member.status !== "approved") {
    return (
      <div className="rounded-2xl border border-dashed border-peci-teal/30 bg-white p-10 text-center">
        <Award className="mx-auto h-8 w-8 text-peci-teal" />
        <p className="mt-4 text-sm text-peci-grey">
          Votre certificat sera disponible dès que votre adhésion aura été approuvée.
        </p>
      </div>
    );
  }

  const handleDownload = async () => {
    if (!token) return;
    setDownloading(true);
    try {
      await downloadWithAuth(
        "/member/certificate/pdf",
        token,
        `certificat-peci-${member.member_number}.pdf`
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-peci-dark">Mon certificat d&apos;adhésion</h1>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl border border-black/5 bg-white p-8 text-center shadow-sm sm:p-12"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl gradient-peci text-white">
          <Award className="h-8 w-8" />
        </div>
        <p className="mt-6 font-display text-lg font-bold text-peci-dark">
          {member.membership_type?.name} — {member.full_name}
        </p>
        <p className="mt-1.5 text-sm text-peci-grey">
          N&deg; membre : {member.member_number ?? "—"}
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-peci-grey">
          Ce certificat atteste de votre adhésion à PECI. Le bureau peut vous contacter pour toute
          information complémentaire (événements, actions...).
        </p>

        <div className="mt-8">
          <Button onClick={handleDownload} disabled={downloading}>
            <Download className="h-4 w-4" />
            Télécharger le certificat (PDF)
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
