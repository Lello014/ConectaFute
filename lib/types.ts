export type AppRole = "admin" | "player" | "captain" | "organizer";
export type FriendlyStatus = "pendente" | "confirmado" | "realizado" | "cancelado";
export type TournamentStatus = "inscricoes" | "em_andamento" | "encerrado";
export type TransactionType = "receita" | "despesa";
export type TransactionCategory = "mensalidade" | "patrocinio" | "aluguel_campo" | "arbitragem" | "material" | "transporte" | "premiacao" | "outros";
export type SponsorStatus = "ativo" | "pausado" | "encerrado";
export type MatchType = "friendly" | "tournament";

export interface Profile {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
  avatar_url: string | null;
  roles: AppRole[];
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  city: string | null;
  state: string | null;
  captain_id: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: "captain" | "player";
  status: "pendente" | "ativo" | "recusado";
  jersey_number: number | null;
  position: string | null;
  joined_at: string;
}

export interface Friendly {
  id: string;
  home_team_id: string;
  away_team_id: string;
  scheduled_at: string;
  location: string | null;
  format: string;
  status: FriendlyStatus;
  home_score: number | null;
  away_score: number | null;
  notes: string | null;
  created_by: string;
  created_at: string;
}

export interface Tournament {
  id: string;
  name: string;
  description: string | null;
  format: string;
  city: string | null;
  state: string | null;
  starts_at: string | null;
  ends_at: string | null;
  max_teams: number | null;
  registration_fee: number;
  prize: string | null;
  status: TournamentStatus;
  organizer_id: string;
  created_at: string;
}

export interface TournamentTeam {
  id: string;
  tournament_id: string;
  team_id: string;
  status: "pendente" | "aprovado" | "rejeitado";
  created_at: string;
}

export interface Match {
  id: string;
  tournament_id: string;
  home_team_id: string;
  away_team_id: string;
  round: number | null;
  group_label: string | null;
  scheduled_at: string | null;
  home_score: number | null;
  away_score: number | null;
  status: "agendado" | "jogado" | "cancelado";
  created_at: string;
}

export interface TeamTransaction {
  id: string;
  team_id: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
  transaction_date: string;
  tournament_id: string | null;
  created_by: string;
  created_at: string;
}

export interface Lineup {
  id: string;
  match_id: string;
  match_type: MatchType;
  team_id: string;
  notes: string | null;
  created_by: string;
  created_at: string;
}

export interface LineupPlayer {
  id: string;
  lineup_id: string;
  player_id: string;
  position: string | null;
  is_starter: boolean;
  sort_order: number;
}

export interface Sponsor {
  id: string;
  team_id: string;
  name: string;
  logo_url: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  monthly_value: number;
  start_date: string | null;
  end_date: string | null;
  status: SponsorStatus;
  notes: string | null;
  created_at: string;
}

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Administrador",
  player: "Jogador",
  captain: "Capitão",
  organizer: "Organizador",
};

export const FRIENDLY_STATUS_LABELS: Record<FriendlyStatus, string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  realizado: "Realizado",
  cancelado: "Cancelado",
};

export const TOURNAMENT_STATUS_LABELS: Record<TournamentStatus, string> = {
  inscricoes: "Inscrições abertas",
  em_andamento: "Em andamento",
  encerrado: "Encerrado",
};

export const TRANSACTION_CATEGORY_LABELS: Record<TransactionCategory, string> = {
  mensalidade: "Mensalidade",
  patrocinio: "Patrocínio",
  aluguel_campo: "Aluguel de campo",
  arbitragem: "Arbitragem",
  material: "Material",
  transporte: "Transporte",
  premiacao: "Premiação",
  outros: "Outros",
};

export const SPONSOR_STATUS_LABELS: Record<SponsorStatus, string> = {
  ativo: "Ativo",
  pausado: "Pausado",
  encerrado: "Encerrado",
};

export const FORMAT_LABELS: Record<string, string> = {
  society: "Society",
  futsal: "Futsal",
  campo: "Campo",
  areia: "Areia",
  rua: "Rua",
};

// ============================================================
// NOVOS TIPOS
// ============================================================

export type PlayerAvailability = "disponivel" | "em_negociacao" | "indisponivel";
export type ContractStatus = "proposta" | "aceito" | "recusado" | "encerrado";
export type JobOfferStatus = "pendente" | "aceita" | "recusada" | "cancelada";
export type ReportStatus = "pendente" | "analisado" | "resolvido" | "arquivado";
export type ReportTargetType = "user" | "team" | "tournament";
export type NotificationType = "info" | "convite" | "proposta" | "resultado" | "sistema";
export type SurfaceType = "grama" | "society" | "areia" | "concreto";
export type Position = "goleiro" | "zagueiro" | "lateral_direito" | "lateral_esquerdo" | "meio" | "atacante";
export type DominantFoot = "destro" | "canhoto" | "ambidestro";

export interface PlayerResume {
  id: string;
  user_id: string;
  position: Position;
  secondary_position: Position | null;
  height: number | null;
  weight: number | null;
  dominant_foot: DominantFoot;
  experience_years: number;
  previous_teams: string | null;
  achievements: string | null;
  video_url: string | null;
  availability: PlayerAvailability;
  created_at: string;
  updated_at: string;
}

export interface PlayerContract {
  id: string;
  player_id: string;
  team_id: string;
  start_date: string;
  end_date: string | null;
  monthly_value: number;
  status: ContractStatus;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface JobOffer {
  id: string;
  team_id: string;
  player_id: string;
  message: string | null;
  position_offered: string | null;
  status: JobOfferStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  entity_type: "team" | "player";
  entity_id: string;
  title: string;
  description: string | null;
  year: number;
  tournament_id: string | null;
  created_at: string;
}

export interface PlayerStats {
  id: string;
  player_id: string;
  tournament_id: string;
  team_id: string;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  matches_played: number;
  minutes_played: number;
  created_at: string;
}

export interface Referee {
  id: string;
  user_id: string;
  certification: string | null;
  experience_years: number;
  available: boolean;
  created_at: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  capacity: number | null;
  surface_type: SurfaceType;
  hourly_rate: number;
  contact_phone: string | null;
  contact_email: string | null;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  description: string | null;
  status: ReportStatus;
  admin_notes: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link: string | null;
  created_at: string;
}

// Labels para os novos tipos

export const POSITION_LABELS: Record<Position, string> = {
  goleiro: "Goleiro",
  zagueiro: "Zagueiro",
  lateral_direito: "Lateral Direito",
  lateral_esquerdo: "Lateral Esquerdo",
  meio: "Meio-campo",
  atacante: "Atacante",
};

export const AVAILABILITY_LABELS: Record<PlayerAvailability, string> = {
  disponivel: "Disponível",
  em_negociacao: "Em Negociação",
  indisponivel: "Indisponível",
};

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  proposta: "Proposta",
  aceito: "Aceito",
  recusado: "Recusado",
  encerrado: "Encerrado",
};

export const JOB_OFFER_STATUS_LABELS: Record<JobOfferStatus, string> = {
  pendente: "Pendente",
  aceita: "Aceita",
  recusada: "Recusada",
  cancelada: "Cancelada",
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  pendente: "Pendente",
  analisado: "Analisado",
  resolvido: "Resolvido",
  arquivado: "Arquivado",
};

export const SURFACE_TYPE_LABELS: Record<SurfaceType, string> = {
  grama: "Grama",
  society: "Society",
  areia: "Areia",
  concreto: "Concreto",
};

export const DOMINANT_FOOT_LABELS: Record<DominantFoot, string> = {
  destro: "Destro",
  canhoto: "Canhoto",
  ambidestro: "Ambidestro",
};
