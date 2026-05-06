// ══════════════════════════════════════════════════════════════
// ADVISEALBERTA — Shared TypeScript Types
// ══════════════════════════════════════════════════════════════

export interface Institution {
  name: string;
  fullName: string;
  city: string;
  type: string;
  color: string;
  website: string;
}

export interface ProgramResult {
  program_name: string;
  institution: string;
  credential?: string;
  duration?: string;
  tuition_domestic?: string;
  tuition_international?: string;
  intake?: string;
  semester_structure?: string;
  source_url?: string;
  match_reason?: string;
  verified?: boolean;
  match_score?: number;
  fee_source_url?: string;
  last_verified?: string;
}

export interface VerifiedProgram {
  institution: string;
  program_name: string;
  credential: string;
  duration: string;
  tuition_domestic: string;
  tuition_international: string;
  intake: string;
  semester_structure: string;
  fee_source_url: string;
  last_verified: string;
  verified?: boolean;
  match_score?: number;
  match_reason?: string;
  source_url?: string;
}

export interface SearchResponse {
  results: ProgramResult[];
  summary: string;
  disclaimer: string;
  searched_at?: string;
  cached_at?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: string;
}

export interface StudentProfileData {
  interests: string[];
  goals: string[];
  personality: string[];
  gpa: string;
  status: string;
  indigenous: boolean;
  financial_need: boolean;
  from_rural: boolean;
  bio: string;
}

export interface Scholarship {
  name: string;
  amount: string;
  type: string;
  note: string;
  url?: string;
  match?: (profile: StudentProfileData) => boolean;
  reason?: string;
}

export interface MatcherFormData {
  grades: string;
  interests: string[];
  city: string;
  budget: string;
  credential: string;
  description: string;
}

export interface MatchRecommendation {
  program: string;
  institution: string;
  match: number;
  reason: string;
  tuition?: string;
  duration?: string;
  admission?: string;
}

export interface CareerData {
  salary: string;
  employment: string;
  growth: string;
  employers: string[];
  titles: string[];
}

export interface DeadlineData {
  date: string;
  applyBy: string;
  label: string;
  type?: string;
}

export interface AlertSubscription {
  userId: string | null;
  email: string | null;
  query: string;
  programs: { program_name: string; institution: string; tuition_domestic?: string }[];
  active: boolean;
  createdAt: unknown;
  lastNotified: unknown;
}

export interface Filters {
  city: string | null;
  credential: string | null;
  maxTuition: number | null;
}
