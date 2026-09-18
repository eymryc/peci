"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Loader2, UploadCloud } from "lucide-react";
import { FieldWrapper, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { api, formatApiErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { MembershipType } from "@/types";

const schema = z
  .object({
    nom: z.string().min(1, "Le nom est requis.").max(100),
    prenoms: z.string().min(1, "Les prénoms sont requis.").max(150),
    date_naissance: z.string().optional(),
    sexe: z.enum(["M", "F", ""]).optional(),
    telephone: z
      .string()
      .min(8, "Numéro de téléphone invalide.")
      .regex(/^[0-9+ ]{8,20}$/, "Numéro de téléphone invalide."),
    whatsapp: z.string().optional(),
    email: z.string().email("Adresse email invalide."),
    ville: z.string().optional(),
    commune: z.string().optional(),
    profession: z.string().optional(),
    membership_type_id: z.string().optional(),
    password: z.string().min(8, "8 caractères minimum."),
    password_confirmation: z.string(),
    accepted_terms: z.boolean().refine((v) => v === true, {
      message: "Vous devez accepter les statuts et le règlement intérieur.",
    }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["password_confirmation"],
  });

type FormValues = z.infer<typeof schema>;

export function MembershipForm({ membershipTypes }: { membershipTypes: MembershipType[] }) {
  const router = useRouter();
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { accepted_terms: false },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setServerError(null);

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value === undefined || value === "") return;
      formData.append(key, typeof value === "boolean" ? (value ? "1" : "0") : String(value));
    });
    if (photo) formData.append("photo", photo);

    try {
      await api.postForm("/auth/register", formData);
      setSubmitted(true);
    } catch (error) {
      setServerError(formatApiErrorMessage(error, "Une erreur inattendue est survenue. Veuillez réessayer."));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-peci-green/20 bg-peci-grey-light p-10 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-peci-green-dark" />
        <h3 className="font-display mt-4 text-xl font-bold text-peci-dark">
          Demande envoyée avec succès
        </h3>
        <p className="mt-2 text-sm text-peci-grey">
          Votre demande d&apos;adhésion est en cours de vérification. Vous recevrez une
          notification dès qu&apos;elle sera traitée, puis pourrez vous connecter à votre espace
          membre pour récupérer votre carte et régler votre droit d&apos;adhésion et vos
          cotisations.
        </p>
        <Button className="mt-6" onClick={() => router.push("/connexion")}>
          Aller à la connexion
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldWrapper label="Nom" required error={errors.nom?.message}>
          <Input {...register("nom")} error={!!errors.nom} />
        </FieldWrapper>
        <FieldWrapper label="Prénoms" required error={errors.prenoms?.message}>
          <Input {...register("prenoms")} error={!!errors.prenoms} />
        </FieldWrapper>
        <FieldWrapper label="Date de naissance" error={errors.date_naissance?.message}>
          <Input type="date" {...register("date_naissance")} />
        </FieldWrapper>
        <FieldWrapper label="Sexe" error={errors.sexe?.message}>
          <Select {...register("sexe")} defaultValue="">
            <option value="">Non précisé</option>
            <option value="F">Féminin</option>
            <option value="M">Masculin</option>
          </Select>
        </FieldWrapper>
        <FieldWrapper label="Téléphone" required error={errors.telephone?.message}>
          <Input type="tel" placeholder="07 00 00 00 00" {...register("telephone")} error={!!errors.telephone} />
        </FieldWrapper>
        <FieldWrapper label="WhatsApp" error={errors.whatsapp?.message}>
          <Input type="tel" placeholder="07 00 00 00 00" {...register("whatsapp")} />
        </FieldWrapper>
        <FieldWrapper label="Email" required error={errors.email?.message}>
          <Input type="email" {...register("email")} error={!!errors.email} />
        </FieldWrapper>
        <FieldWrapper
          label="Type de membre"
          error={errors.membership_type_id?.message}
          hint="Le droit d'adhésion et la cotisation mensuelle dépendent du type choisi."
        >
          <Select {...register("membership_type_id")} defaultValue="">
            <option value="">Sélectionner</option>
            {membershipTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name} — adhésion {type.adhesion_fee > 0 ? formatCurrency(type.adhesion_fee) : "gratuite"}, cotisation{" "}
                {type.cotisation_fee > 0 ? `${formatCurrency(type.cotisation_fee)}/mois` : "gratuite"}
              </option>
            ))}
          </Select>
        </FieldWrapper>
        <FieldWrapper label="Ville" error={errors.ville?.message}>
          <Input {...register("ville")} />
        </FieldWrapper>
        <FieldWrapper label="Commune" error={errors.commune?.message}>
          <Input {...register("commune")} />
        </FieldWrapper>
        <FieldWrapper label="Profession" className="sm:col-span-2" error={errors.profession?.message}>
          <Input {...register("profession")} />
        </FieldWrapper>
      </div>

      <FieldWrapper label="Photo d'identité" hint="JPG ou PNG, 4 Mo maximum — utilisée sur votre carte de membre.">
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
        <FieldWrapper label="Mot de passe" required error={errors.password?.message} hint="8 caractères minimum, pour accéder à votre espace membre.">
          <Input type="password" {...register("password")} error={!!errors.password} />
        </FieldWrapper>
        <FieldWrapper label="Confirmation du mot de passe" required error={errors.password_confirmation?.message}>
          <Input type="password" {...register("password_confirmation")} error={!!errors.password_confirmation} />
        </FieldWrapper>
      </div>

      <label className="flex items-start gap-3 text-sm text-peci-grey">
        <input type="checkbox" className="mt-1 h-4 w-4 rounded border-black/20 text-peci-teal" {...register("accepted_terms")} />
        J&apos;accepte les statuts et le règlement intérieur de PECI.
      </label>
      {errors.accepted_terms && <p className="text-xs text-red-600">{errors.accepted_terms.message}</p>}

      {serverError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{serverError}</div>
      )}

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={submitting}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Envoyer ma demande d&apos;adhésion
      </Button>
    </form>
  );
}
