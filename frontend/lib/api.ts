import type { ApiError, ApiSuccess } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export class ApiRequestError extends Error {
  errors: Record<string, string[]> | null;
  status: number;

  constructor(message: string, status: number, errors: Record<string, string[]> | null) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.errors = errors;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  token?: string | null;
  body?: unknown;
  isFormData?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, body, isFormData, headers, ...rest } = options;

  const finalHeaders: HeadersInit = {
    Accept: "application/json",
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const response = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    ...rest,
    headers: finalHeaders,
    body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
  });

  const json = (await response.json().catch(() => null)) as ApiSuccess<T> | ApiError | null;

  if (!response.ok || !json || json.success === false) {
    const message = json?.message ?? "Une erreur est survenue. Veuillez réessayer.";
    const errors = json && "errors" in json ? json.errors : null;

    // Un token expiré/invalide renvoie 401 sur une route authentifiée : sans
    // ça, les pages admin restent bloquées en "chargement" indéfiniment (la
    // requête échoue mais rien ne prévient l'UI). On signale une déconnexion
    // globale — voir auth-context.tsx qui l'écoute pour nettoyer la session
    // et renvoyer vers /connexion — sauf sur la tentative de login elle-même.
    if (response.status === 401 && token && path !== "/auth/login" && typeof window !== "undefined") {
      window.dispatchEvent(new Event("peci:unauthorized"));
    }

    throw new ApiRequestError(message, response.status, errors);
  }

  return json.data;
}

export const api = {
  get: <T>(path: string, token?: string | null) => request<T>(path, { method: "GET", token }),
  post: <T>(path: string, body?: unknown, token?: string | null) =>
    request<T>(path, { method: "POST", body, token }),
  postForm: <T>(path: string, body: FormData, token?: string | null) =>
    request<T>(path, { method: "POST", body, token, isFormData: true }),
  put: <T>(path: string, body?: unknown, token?: string | null) =>
    request<T>(path, { method: "PUT", body, token }),
  // Laravel ne parse pas les corps multipart des requêtes PUT : on envoie en
  // POST avec `_method=PUT` (form method spoofing), supporté nativement.
  putForm: <T>(path: string, body: FormData, token?: string | null) => {
    body.append("_method", "PUT");
    return request<T>(path, { method: "POST", body, token, isFormData: true });
  },
  delete: <T>(path: string, token?: string | null) => request<T>(path, { method: "DELETE", token }),
};

export async function downloadWithAuth(path: string, token: string, filename: string) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new ApiRequestError("Téléchargement impossible.", response.status, null);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// Les erreurs de validation Laravel arrivent dans `err.errors` (par champ) —
// le message générique de `err.message` ne dit jamais ce qui cloche.
export function formatApiErrorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof ApiRequestError)) return fallback;
  if (err.errors) {
    const details = Object.values(err.errors).flat().filter(Boolean);
    if (details.length > 0) return details.join(" ");
  }
  return err.message || fallback;
}

export async function fetchAuthenticatedBlobUrl(path: string, token: string): Promise<string> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new ApiRequestError("Chargement impossible.", response.status, null);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
