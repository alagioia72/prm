import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, boolean, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const clubs = pgTable("clubs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  courtsCount: integer("courts_count").notNull().default(1),
  rollingWeeks: integer("rolling_weeks"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertClubSchema = createInsertSchema(clubs).omit({
  id: true,
  createdAt: true,
});

export type InsertClub = z.infer<typeof insertClubSchema>;
export type Club = typeof clubs.$inferSelect;

export const chainSettings = pgTable("chain_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertChainSettingSchema = createInsertSchema(chainSettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertChainSetting = z.infer<typeof insertChainSettingSchema>;
export type ChainSetting = typeof chainSettings.$inferSelect;

export const scoringProfiles = pgTable("scoring_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  participationPoints: integer("participation_points").notNull().default(10),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertScoringProfileSchema = createInsertSchema(scoringProfiles).omit({
  id: true,
  createdAt: true,
});

export type InsertScoringProfile = z.infer<typeof insertScoringProfileSchema>;
export type ScoringProfile = typeof scoringProfiles.$inferSelect;

export const scoringEntries = pgTable("scoring_entries", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull(),
  position: integer("position").notNull(),
  points: integer("points").notNull(),
});

export const insertScoringEntrySchema = createInsertSchema(scoringEntries).omit({
  id: true,
});

export type InsertScoringEntry = z.infer<typeof insertScoringEntrySchema>;
export type ScoringEntry = typeof scoringEntries.$inferSelect;

export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  clubId: integer("club_id").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  registrationType: text("registration_type").notNull().default("couple"),
  format: text("format").notNull().default("bracket"),
  gender: text("gender").notNull().default("mixed"),
  level: text("level").notNull().default("intermediate"),
  maxParticipants: integer("max_participants").notNull().default(16),
  pointsMultiplier: real("points_multiplier").notNull().default(1.0),
  scoringProfileId: integer("scoring_profile_id"),
  status: text("status").notNull().default("upcoming"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTournamentSchema = createInsertSchema(tournaments).omit({
  id: true,
  createdAt: true,
});

export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type Tournament = typeof tournaments.$inferSelect;

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  clubId: integer("club_id").notNull(),
  playedAt: timestamp("played_at").notNull().defaultNow(),
  team1Player1Id: text("team1_player1_id").notNull(),
  team1Player2Id: text("team1_player2_id"),
  team2Player1Id: text("team2_player1_id").notNull(),
  team2Player2Id: text("team2_player2_id"),
  set1Team1: integer("set1_team1").notNull(),
  set1Team2: integer("set1_team2").notNull(),
  set2Team1: integer("set2_team1").notNull(),
  set2Team2: integer("set2_team2").notNull(),
  set3Team1: integer("set3_team1"),
  set3Team2: integer("set3_team2"),
  setsPlayed: integer("sets_played").notNull().default(2),
  winnerTeam: integer("winner_team").notNull(),
  pointsAwarded: integer("points_awarded").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  createdAt: true,
});

export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;

export interface ScoringProfileWithEntries extends ScoringProfile {
  entries: ScoringEntry[];
}

export interface ScoreCalculation {
  position: number;
  basePoints: number;
  multiplier: number;
  finalPoints: number;
}

export interface MatchPointsCalculation {
  basePoints: number;
  setsPlayed: 2 | 3;
  divisor: 5 | 6;
  pointsAwarded: number;
}

export const tournamentResults = pgTable("tournament_results", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").notNull(),
  position: integer("position").notNull(),
  playerId: text("player_id"),
  player2Id: text("player2_id"),
  basePoints: integer("base_points").notNull(),
  multiplier: real("multiplier").notNull().default(1.0),
  finalPoints: integer("final_points").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTournamentResultSchema = createInsertSchema(tournamentResults).omit({
  id: true,
  createdAt: true,
});

export type InsertTournamentResult = z.infer<typeof insertTournamentResultSchema>;
export type TournamentResult = typeof tournamentResults.$inferSelect;

export interface TournamentRanking {
  position: number;
  playerId?: string;
  player2Id?: string;
  playerName?: string;
  player2Name?: string;
  basePoints: number;
  multiplier: number;
  finalPoints: number;
}

export const tournamentRegistrations = pgTable("tournament_registrations", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").notNull(),
  playerId: text("player_id").notNull(),
  partnerId: text("partner_id"),
  status: text("status").notNull().default("confirmed"),
  registeredAt: timestamp("registered_at").defaultNow(),
});

export const insertTournamentRegistrationSchema = createInsertSchema(tournamentRegistrations).omit({
  id: true,
  registeredAt: true,
});

export type InsertTournamentRegistration = z.infer<typeof insertTournamentRegistrationSchema>;
export type TournamentRegistration = typeof tournamentRegistrations.$inferSelect;

export const players = pgTable("players", {
  id: text("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  gender: text("gender").notNull().default("male"),
  level: text("level").notNull().default("intermediate"),
  clubId: integer("club_id"),
  totalPoints: integer("total_points").notNull().default(0),
  emailVerified: boolean("email_verified").notNull().default(false),
  verificationToken: text("verification_token"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  createdAt: true,
  emailVerified: true,
  verificationToken: true,
});

export const registerPlayerSchema = z.object({
  firstName: z.string().min(2, "Il nome deve avere almeno 2 caratteri"),
  lastName: z.string().min(2, "Il cognome deve avere almeno 2 caratteri"),
  email: z.string().email("Email non valida"),
  password: z.string().min(8, "La password deve avere almeno 8 caratteri"),
  gender: z.enum(["male", "female", "other"]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  clubId: z.number().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(1, "Password richiesta"),
});

export type RegisterPlayer = z.infer<typeof registerPlayerSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

export interface TournamentRegistrationWithPlayers extends TournamentRegistration {
  player?: Player;
  partner?: Player;
}
