import { type ScoringProfile, type InsertScoringProfile, type ScoringEntry, type InsertScoringEntry, type ScoringProfileWithEntries, type Club, type InsertClub, type Match, type InsertMatch, type MatchPointsCalculation, type TournamentResult, type InsertTournamentResult, type Tournament, type InsertTournament, type TournamentRegistration, type InsertTournamentRegistration, type Player, type InsertPlayer, type TournamentRegistrationWithPlayers, type ChainSetting, type InsertChainSetting, clubs, chainSettings, scoringProfiles, scoringEntries, tournaments, matches, tournamentResults, tournamentRegistrations, players } from "../shared/schema.ts";
import { db } from "./db.ts";
import { eq, and, or, desc, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  getClubs(): Promise<Club[]>;
  getClub(id: number): Promise<Club | undefined>;
  createClub(club: InsertClub): Promise<Club>;
  updateClub(id: number, updates: Partial<InsertClub>): Promise<Club | undefined>;
  deleteClub(id: number): Promise<boolean>;
  
  getChainSettings(): Promise<ChainSetting[]>;
  getChainSetting(key: string): Promise<ChainSetting | undefined>;
  setChainSetting(setting: InsertChainSetting): Promise<ChainSetting>;
  
  getScoringProfiles(): Promise<ScoringProfile[]>;
  getScoringProfile(id: number): Promise<ScoringProfile | undefined>;
  getDefaultScoringProfile(): Promise<ScoringProfileWithEntries | undefined>;
  getScoringProfileWithEntries(id: number): Promise<ScoringProfileWithEntries | undefined>;
  createScoringProfile(profile: InsertScoringProfile): Promise<ScoringProfile>;
  updateScoringProfile(id: number, profile: Partial<InsertScoringProfile>): Promise<ScoringProfile | undefined>;
  setScoringEntries(profileId: number, entries: { position: number; points: number }[]): Promise<ScoringEntry[]>;
  setDefaultProfile(id: number): Promise<void>;
  
  getMatches(): Promise<Match[]>;
  getMatchesByPlayer(playerId: string): Promise<Match[]>;
  getMatchesByClub(clubId: number): Promise<Match[]>;
  getMatch(id: number): Promise<Match | undefined>;
  createMatch(match: InsertMatch): Promise<Match>;
  calculateMatchPoints(setsPlayed: 2 | 3): Promise<MatchPointsCalculation>;
  
  getTournaments(): Promise<Tournament[]>;
  getTournament(id: number): Promise<Tournament | undefined>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  updateTournament(id: number, updates: Partial<InsertTournament>): Promise<Tournament | undefined>;
  deleteTournament(id: number): Promise<boolean>;
  
  getTournamentResults(tournamentId: number): Promise<TournamentResult[]>;
  saveTournamentResults(tournamentId: number, results: InsertTournamentResult[]): Promise<TournamentResult[]>;
  deleteTournamentResults(tournamentId: number): Promise<void>;
  
  getTournamentRegistrations(tournamentId: number): Promise<TournamentRegistration[]>;
  getTournamentRegistrationsWithPlayers(tournamentId: number): Promise<TournamentRegistrationWithPlayers[]>;
  getPlayerRegistrations(playerId: string): Promise<TournamentRegistration[]>;
  getRegistration(tournamentId: number, playerId: string): Promise<TournamentRegistration | undefined>;
  createRegistration(registration: InsertTournamentRegistration): Promise<TournamentRegistration>;
  deleteRegistration(tournamentId: number, playerId: string): Promise<boolean>;
  
  getPlayers(): Promise<Player[]>;
  getPlayer(id: string): Promise<Player | undefined>;
  getPlayerByEmail(email: string): Promise<Player | undefined>;
  getPlayerByVerificationToken(token: string): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: string, updates: Partial<InsertPlayer>): Promise<Player | undefined>;
  deletePlayer(id: string): Promise<boolean>;
  getEligiblePlayersForTournament(gender: string, level: string): Promise<Player[]>;
  
  initializeDefaults(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  
  async initializeDefaults(): Promise<void> {
    const existingAdmin = await this.getPlayerByEmail("admin@gonettago.it");
    if (!existingAdmin) {
      const adminPasswordHash = await bcrypt.hash("Ranking123", 10);
      await db.insert(players).values({
        id: "admin-1",
        firstName: "Admin",
        lastName: "GonettaGO",
        email: "admin@gonettago.it",
        password: adminPasswordHash,
        gender: "male",
        level: "advanced",
        clubId: null,
        totalPoints: 0,
        emailVerified: true,
        verificationToken: null,
        role: "admin",
      });
      console.log("Default admin account created: admin@gonettago.it");
    }

    const existingProfiles = await this.getScoringProfiles();
    if (existingProfiles.length === 0) {
      const [profile] = await db.insert(scoringProfiles).values({
        name: "Profilo Standard",
        isDefault: true,
        participationPoints: 10,
      }).returning();

      const defaultEntries = [
        { profileId: profile.id, position: 1, points: 100 },
        { profileId: profile.id, position: 2, points: 80 },
        { profileId: profile.id, position: 3, points: 65 },
        { profileId: profile.id, position: 4, points: 55 },
        { profileId: profile.id, position: 5, points: 45 },
        { profileId: profile.id, position: 6, points: 40 },
        { profileId: profile.id, position: 7, points: 35 },
        { profileId: profile.id, position: 8, points: 30 },
        { profileId: profile.id, position: 9, points: 25 },
        { profileId: profile.id, position: 10, points: 22 },
        { profileId: profile.id, position: 11, points: 20 },
        { profileId: profile.id, position: 12, points: 18 },
        { profileId: profile.id, position: 13, points: 16 },
        { profileId: profile.id, position: 14, points: 14 },
        { profileId: profile.id, position: 15, points: 12 },
        { profileId: profile.id, position: 16, points: 11 },
      ];
      await db.insert(scoringEntries).values(defaultEntries);
      console.log("Default scoring profile created");
    }
  }

  async getClubs(): Promise<Club[]> {
    return await db.select().from(clubs);
  }

  async getClub(id: number): Promise<Club | undefined> {
    const [club] = await db.select().from(clubs).where(eq(clubs.id, id));
    return club;
  }

  async createClub(club: InsertClub): Promise<Club> {
    const [created] = await db.insert(clubs).values(club).returning();
    return created;
  }

  async updateClub(id: number, updates: Partial<InsertClub>): Promise<Club | undefined> {
    const [updated] = await db.update(clubs).set(updates).where(eq(clubs.id, id)).returning();
    return updated;
  }

  async deleteClub(id: number): Promise<boolean> {
    const result = await db.delete(clubs).where(eq(clubs.id, id)).returning();
    return result.length > 0;
  }

  async getChainSettings(): Promise<ChainSetting[]> {
    return await db.select().from(chainSettings);
  }

  async getChainSetting(key: string): Promise<ChainSetting | undefined> {
    const [setting] = await db.select().from(chainSettings).where(eq(chainSettings.key, key));
    return setting;
  }

  async setChainSetting(setting: InsertChainSetting): Promise<ChainSetting> {
    const existing = await this.getChainSetting(setting.key);
    if (existing) {
      const [updated] = await db.update(chainSettings)
        .set({ value: setting.value, description: setting.description, updatedAt: new Date() })
        .where(eq(chainSettings.key, setting.key))
        .returning();
      return updated;
    }
    const [created] = await db.insert(chainSettings).values(setting).returning();
    return created;
  }

  async getScoringProfiles(): Promise<ScoringProfile[]> {
    return await db.select().from(scoringProfiles);
  }

  async getScoringProfile(id: number): Promise<ScoringProfile | undefined> {
    const [profile] = await db.select().from(scoringProfiles).where(eq(scoringProfiles.id, id));
    return profile;
  }

  async getDefaultScoringProfile(): Promise<ScoringProfileWithEntries | undefined> {
    const [profile] = await db.select().from(scoringProfiles).where(eq(scoringProfiles.isDefault, true));
    if (!profile) return undefined;
    const entries = await db.select().from(scoringEntries).where(eq(scoringEntries.profileId, profile.id));
    return { ...profile, entries };
  }

  async getScoringProfileWithEntries(id: number): Promise<ScoringProfileWithEntries | undefined> {
    const profile = await this.getScoringProfile(id);
    if (!profile) return undefined;
    const entries = await db.select().from(scoringEntries).where(eq(scoringEntries.profileId, id));
    return { ...profile, entries };
  }

  async createScoringProfile(profile: InsertScoringProfile): Promise<ScoringProfile> {
    const [created] = await db.insert(scoringProfiles).values(profile).returning();
    return created;
  }

  async updateScoringProfile(id: number, updates: Partial<InsertScoringProfile>): Promise<ScoringProfile | undefined> {
    const [updated] = await db.update(scoringProfiles).set(updates).where(eq(scoringProfiles.id, id)).returning();
    return updated;
  }

  async setScoringEntries(profileId: number, entries: { position: number; points: number }[]): Promise<ScoringEntry[]> {
    await db.delete(scoringEntries).where(eq(scoringEntries.profileId, profileId));
    const toInsert = entries.map(e => ({ profileId, position: e.position, points: e.points }));
    return await db.insert(scoringEntries).values(toInsert).returning();
  }

  async setDefaultProfile(id: number): Promise<void> {
    await db.update(scoringProfiles).set({ isDefault: false });
    await db.update(scoringProfiles).set({ isDefault: true }).where(eq(scoringProfiles.id, id));
  }

  async getMatches(): Promise<Match[]> {
    return await db.select().from(matches).orderBy(desc(matches.playedAt));
  }

  async getMatchesByPlayer(playerId: string): Promise<Match[]> {
    return await db.select().from(matches).where(
      or(
        eq(matches.team1Player1Id, playerId),
        eq(matches.team1Player2Id, playerId),
        eq(matches.team2Player1Id, playerId),
        eq(matches.team2Player2Id, playerId)
      )
    ).orderBy(desc(matches.playedAt));
  }

  async getMatchesByClub(clubId: number): Promise<Match[]> {
    return await db.select().from(matches).where(eq(matches.clubId, clubId)).orderBy(desc(matches.playedAt));
  }

  async getMatch(id: number): Promise<Match | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    return match;
  }

  async createMatch(match: InsertMatch): Promise<Match> {
    const [created] = await db.insert(matches).values(match).returning();
    return created;
  }

  async calculateMatchPoints(setsPlayed: 2 | 3): Promise<MatchPointsCalculation> {
    const defaultProfile = await this.getDefaultScoringProfile();
    const firstPlaceEntry = defaultProfile?.entries.find(e => e.position === 1);
    const basePoints = firstPlaceEntry?.points ?? 100;
    const divisor = setsPlayed === 2 ? 5 : 6;
    const pointsAwarded = Math.round(basePoints / divisor);
    
    return { basePoints, setsPlayed, divisor, pointsAwarded };
  }

  async getTournaments(): Promise<Tournament[]> {
    return await db.select().from(tournaments).orderBy(desc(tournaments.startDate));
  }

  async getTournament(id: number): Promise<Tournament | undefined> {
    const [tournament] = await db.select().from(tournaments).where(eq(tournaments.id, id));
    return tournament;
  }

  async createTournament(tournament: InsertTournament): Promise<Tournament> {
    const [created] = await db.insert(tournaments).values(tournament).returning();
    return created;
  }

  async updateTournament(id: number, updates: Partial<InsertTournament>): Promise<Tournament | undefined> {
    const [updated] = await db.update(tournaments).set(updates).where(eq(tournaments.id, id)).returning();
    return updated;
  }

  async deleteTournament(id: number): Promise<boolean> {
    await this.deleteTournamentResults(id);
    await db.delete(tournamentRegistrations).where(eq(tournamentRegistrations.tournamentId, id));
    const result = await db.delete(tournaments).where(eq(tournaments.id, id)).returning();
    return result.length > 0;
  }

  async getTournamentResults(tournamentId: number): Promise<TournamentResult[]> {
    return await db.select().from(tournamentResults).where(eq(tournamentResults.tournamentId, tournamentId));
  }

  async saveTournamentResults(tournamentId: number, results: InsertTournamentResult[]): Promise<TournamentResult[]> {
    await this.deleteTournamentResults(tournamentId);
    const toInsert = results.map(r => ({ ...r, tournamentId }));
    return await db.insert(tournamentResults).values(toInsert).returning();
  }

  async deleteTournamentResults(tournamentId: number): Promise<void> {
    await db.delete(tournamentResults).where(eq(tournamentResults.tournamentId, tournamentId));
  }

  async getTournamentRegistrations(tournamentId: number): Promise<TournamentRegistration[]> {
    return await db.select().from(tournamentRegistrations).where(eq(tournamentRegistrations.tournamentId, tournamentId));
  }

  async getTournamentRegistrationsWithPlayers(tournamentId: number): Promise<TournamentRegistrationWithPlayers[]> {
    const regs = await this.getTournamentRegistrations(tournamentId);
    return Promise.all(regs.map(async (reg) => {
      const player = await this.getPlayer(reg.playerId);
      const partner = reg.partnerId ? await this.getPlayer(reg.partnerId) : undefined;
      return { ...reg, player, partner };
    }));
  }

  async getPlayerRegistrations(playerId: string): Promise<TournamentRegistration[]> {
    return await db.select().from(tournamentRegistrations).where(
      or(eq(tournamentRegistrations.playerId, playerId), eq(tournamentRegistrations.partnerId, playerId))
    );
  }

  async getRegistration(tournamentId: number, playerId: string): Promise<TournamentRegistration | undefined> {
    const [reg] = await db.select().from(tournamentRegistrations).where(
      and(
        eq(tournamentRegistrations.tournamentId, tournamentId),
        or(eq(tournamentRegistrations.playerId, playerId), eq(tournamentRegistrations.partnerId, playerId))
      )
    );
    return reg;
  }

  async createRegistration(registration: InsertTournamentRegistration): Promise<TournamentRegistration> {
    const [created] = await db.insert(tournamentRegistrations).values(registration).returning();
    return created;
  }

  async deleteRegistration(tournamentId: number, playerId: string): Promise<boolean> {
    const reg = await this.getRegistration(tournamentId, playerId);
    if (!reg) return false;
    await db.delete(tournamentRegistrations).where(eq(tournamentRegistrations.id, reg.id));
    return true;
  }

  async getPlayers(): Promise<Player[]> {
    return await db.select().from(players);
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player;
  }

  async getPlayerByEmail(email: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.email, email));
    return player;
  }

  async getPlayerByVerificationToken(token: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.verificationToken, token));
    return player;
  }

  async createPlayer(player: InsertPlayer): Promise<Player> {
    const [created] = await db.insert(players).values({
      ...player,
      emailVerified: false,
      role: "player",
    }).returning();
    return created;
  }

  async updatePlayer(id: string, updates: Partial<InsertPlayer>): Promise<Player | undefined> {
    const [updated] = await db.update(players).set(updates).where(eq(players.id, id)).returning();
    return updated;
  }

  async deletePlayer(id: string): Promise<boolean> {
    const result = await db.delete(players).where(eq(players.id, id)).returning();
    return result.length > 0;
  }

  async getEligiblePlayersForTournament(gender: string, level: string): Promise<Player[]> {
    const allPlayers = await this.getPlayers();
    return allPlayers.filter(p => {
      const genderMatch = gender === "mixed" || p.gender === gender;
      const levelMatch = p.level === level;
      return genderMatch && levelMatch && p.emailVerified;
    });
  }
}

export const storage = new DatabaseStorage();
