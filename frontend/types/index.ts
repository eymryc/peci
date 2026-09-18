export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors: Record<string, string[]> | null;
}

export interface Paginated<T> {
  items: T[];
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

export interface Project {
  id: number;
  title: string;
  slug: string;
  cover_image_url: string | null;
  description: string;
  location: string | null;
  region: string | null;
  beneficiaries: number | null;
  progress: number;
  status: "planned" | "ongoing" | "completed" | "suspended";
  starts_at: string | null;
  ends_at: string | null;
}

export interface ProjectDetail extends Project {
  objective: string | null;
  budget: number | null;
  partners: string[];
  results: string[];
  images: { id: number; url: string; caption: string | null }[];
  updates: { id: number; title: string; content: string; date: string }[];
}

export interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  image_url: string | null;
  excerpt: string | null;
  content: string;
  author: string | null;
  category: string | null;
  news_category_id?: number | null;
  status?: "draft" | "published";
  published_at: string | null;
}

export interface ResourceFile {
  id: number;
  title: string;
  type: "pdf" | "guide" | "fiche" | "document" | "video" | "publication";
  file_url: string;
  description: string | null;
  category: string | null;
  resource_category_id?: number | null;
  downloads_count: number;
}

export interface ActionItem {
  id: number;
  title: string;
  slug: string;
  category: string | null;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  order?: number;
}

export interface Partner {
  id: number;
  name: string;
  logo_url: string | null;
  website: string | null;
  description: string | null;
  type: string | null;
  order?: number;
  is_active?: boolean;
}

export interface RegionStat {
  slug: string;
  name: string;
  projects_count: number;
  beneficiaries_count: number;
}

export interface GalleryImageItem {
  id: number;
  url: string;
  caption: string | null;
  category: "actions" | "ecoles" | "jeunes" | "evenements" | "benevolat";
  order: number;
  is_active: boolean;
  is_featured: boolean;
}

export interface InterventionCity {
  id: number;
  name: string;
  slug: string;
  order: number;
  is_active: boolean;
  projects_count: number;
  beneficiaries_count: number;
}

export interface MembershipType {
  id: number;
  name: string;
  slug?: string;
  description?: string | null;
  duration_months?: number;
  adhesion_fee: number;
  cotisation_fee: number;
  merchandise_items?: string | null;
  card_eligible?: boolean;
  is_active?: boolean;
  members_count?: number;
}

export interface MemberCard {
  card_number: string;
  version: number;
  status: "valid" | "expired" | "suspended" | "revoked";
  issued_at: string;
  expires_at: string;
  image_url: string;
  pdf_url: string;
}

export interface MemberMerchandiseDelivery {
  id: number;
  item: string;
  delivered_at: string | null;
  delivered_by: string | null;
}

export interface Member {
  id: number;
  member_number: string | null;
  nom: string;
  prenoms: string;
  full_name: string;
  date_naissance: string | null;
  sexe: "M" | "F" | null;
  telephone: string;
  whatsapp: string | null;
  email: string;
  ville: string | null;
  commune: string | null;
  profession: string | null;
  has_photo: boolean;
  status: "pending" | "under_review" | "approved" | "rejected" | "suspended" | "expired";
  membership_type: MembershipType | null;
  joined_at: string | null;
  expires_at: string | null;
  adhesion_confirmed_at: string | null;
  // La carte n'est incluse que dans les réponses admin — jamais côté membre.
  card?: MemberCard | null;
  merchandise_deliveries?: MemberMerchandiseDelivery[];
  payments?: MembershipPayment[];
  rejection_reason?: string | null;
  created_at: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "staff" | "member";
  member_id: number | null;
}

export interface MembershipPayment {
  id: number;
  type: "adhesion" | "cotisation";
  period: string | null;
  amount: number;
  method: string | null;
  reference: string | null;
  status: "paid" | "pending" | "expired";
  paid_at: string | null;
  created_at: string;
}

export interface MembershipPaymentsResponse {
  items: MembershipPayment[];
  fees: { adhesion: number; cotisation: number };
  adhesion_paid: boolean;
}

export interface AdminSetting {
  key: string;
  type: "string" | "integer" | "boolean" | "json";
  value: string | number | boolean | null;
}

export interface AppNotification {
  id: string;
  type: string;
  data: { title: string; message: string; [key: string]: unknown };
  read_at: string | null;
  created_at: string;
}

export interface Announcement {
  id: number;
  title: string;
  message: string;
  recipients_count: number;
  sent_sms: boolean;
  sent_by: string | null;
  created_at: string;
}

export interface SimpleCategory {
  id: number;
  name: string;
  slug: string;
}

export interface DashboardData {
  stats: {
    members: {
      total: number;
      approved: number;
      pending: number;
      expired: number;
      new_this_month: number;
    };
    cards_generated: number;
    projects: { total: number; ongoing: number; completed: number };
    volunteers: number;
    donations: { total_amount: number; count: number };
    payments: { paid_this_month: number; pending_count: number };
  };
  members_growth: { month: string; value: number }[];
  payments_growth: { month: string; value: number }[];
  projects_by_status: { status: string; count: number }[];
  members_by_region: { type: string; count: number }[];
}

export interface VerifyResult {
  state: "VALID" | "EXPIRED" | "SUSPENDED" | "NOT_FOUND";
  valid: boolean;
  nom?: string;
  prenoms?: string;
  member_number?: string;
  status?: string;
  joined_at?: string | null;
  expires_at?: string;
}
