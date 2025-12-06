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
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertClubSchema = createInsertSchema(clubs).omit({
  id: true,
  createdAt: true,
});

export type InsertClub = z.infer<typeof insertClubSchema>;
export type Club = typeof clubs.$inferSelect;

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

export interface ScoringProfileWithEntries extends ScoringProfile {
  entries: ScoringEntry[];
}

export interface ScoreCalculation {
  position: number;
  basePoints: number;
  multiplier: number;
  finalPoints: number;
}
