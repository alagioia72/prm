import { type User, type InsertUser, type ScoringProfile, type InsertScoringProfile, type ScoringEntry, type InsertScoringEntry, type ScoringProfileWithEntries, type Club, type InsertClub, type Match, type InsertMatch, type MatchPointsCalculation, type TournamentResult, type InsertTournamentResult, type Tournament, type InsertTournament, type TournamentRegistration, type InsertTournamentRegistration, type Player, type InsertPlayer, type TournamentRegistrationWithPlayers } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getClubs(): Promise<Club[]>;
  getClub(id: number): Promise<Club | undefined>;
  createClub(club: InsertClub): Promise<Club>;
  
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
  getEligiblePlayersForTournament(gender: string, level: string): Promise<Player[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private clubs: Map<number, Club>;
  private scoringProfiles: Map<number, ScoringProfile>;
  private scoringEntries: Map<number, ScoringEntry[]>;
  private matches: Map<number, Match>;
  private tournaments: Map<number, Tournament>;
  private tournamentResults: Map<number, TournamentResult[]>;
  private tournamentRegistrations: Map<string, TournamentRegistration>;
  private players: Map<string, Player>;
  private nextClubId = 1;
  private nextProfileId = 1;
  private nextEntryId = 1;
  private nextMatchId = 1;
  private nextTournamentId = 1;
  private nextTournamentResultId = 1;
  private nextRegistrationId = 1;

  constructor() {
    this.users = new Map();
    this.clubs = new Map();
    this.scoringProfiles = new Map();
    this.scoringEntries = new Map();
    this.matches = new Map();
    this.tournaments = new Map();
    this.tournamentResults = new Map();
    this.tournamentRegistrations = new Map();
    this.players = new Map();
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    const defaultProfile: ScoringProfile = {
      id: this.nextProfileId++,
      name: "Profilo Standard",
      isDefault: true,
      participationPoints: 10,
      createdAt: new Date(),
    };
    this.scoringProfiles.set(defaultProfile.id, defaultProfile);

    const defaultEntries: ScoringEntry[] = [
      { id: this.nextEntryId++, profileId: defaultProfile.id, position: 1, points: 100 },
      { id: this.nextEntryId++, profileId: defaultProfile.id, position: 2, points: 80 },
      { id: this.nextEntryId++, profileId: defaultProfile.id, position: 3, points: 65 },
      { id: this.nextEntryId++, profileId: defaultProfile.id, position: 4, points: 55 },
      { id: this.nextEntryId++, profileId: defaultProfile.id, position: 5, points: 45 },
      { id: this.nextEntryId++, profileId: defaultProfile.id, position: 6, points: 40 },
      { id: this.nextEntryId++, profileId: defaultProfile.id, position: 7, points: 35 },
      { id: this.nextEntryId++, profileId: defaultProfile.id, position: 8, points: 30 },
      { id: this.nextEntryId++, profileId: defaultProfile.id, position: 9, points: 25 },
      { id: this.nextEntryId++, profileId: defaultProfile.id, position: 10, points: 22 },
      { id: this.nextEntryId++, profileId: defaultProfile.id, position: 11, points: 20 },
      { id: this.nextEntryId++, profileId: defaultProfile.id, position: 12, points: 18 },
      { id: this.nextEntryId++, profileId: defaultProfile.id, position: 13, points: 16 },
      { id: this.nextEntryId++, profileId: defaultProfile.id, position: 14, points: 14 },
      { id: this.nextEntryId++, profileId: defaultProfile.id, position: 15, points: 12 },
      { id: this.nextEntryId++, profileId: defaultProfile.id, position: 16, points: 11 },
    ];
    this.scoringEntries.set(defaultProfile.id, defaultEntries);

    const defaultClubs: Club[] = [
      { id: this.nextClubId++, name: "Padel Club Milano Centro", address: "Via Roma 123", city: "Milano", courtsCount: 6, createdAt: new Date() },
      { id: this.nextClubId++, name: "Padel Club Milano Nord", address: "Via Torino 45", city: "Milano", courtsCount: 4, createdAt: new Date() },
      { id: this.nextClubId++, name: "Padel Club Roma Sud", address: "Viale Europa 78", city: "Roma", courtsCount: 8, createdAt: new Date() },
    ];
    defaultClubs.forEach(club => this.clubs.set(club.id, club));

    const defaultTournaments: Tournament[] = [
      {
        id: this.nextTournamentId++,
        name: "Torneo Primavera 2024",
        clubId: 1,
        startDate: new Date("2024-04-15"),
        endDate: null,
        registrationType: "couple",
        format: "bracket",
        gender: "mixed",
        level: "intermediate",
        maxParticipants: 16,
        pointsMultiplier: 2,
        scoringProfileId: 1,
        status: "upcoming",
        createdAt: new Date(),
      },
      {
        id: this.nextTournamentId++,
        name: "Campionato Regionale",
        clubId: 2,
        startDate: new Date("2024-04-22"),
        endDate: null,
        registrationType: "couple",
        format: "bracket",
        gender: "male",
        level: "advanced",
        maxParticipants: 32,
        pointsMultiplier: 3,
        scoringProfileId: 1,
        status: "upcoming",
        createdAt: new Date(),
      },
      {
        id: this.nextTournamentId++,
        name: "Round Robin Principianti",
        clubId: 3,
        startDate: new Date("2024-04-28"),
        endDate: null,
        registrationType: "individual",
        format: "round_robin",
        gender: "female",
        level: "beginner",
        maxParticipants: 8,
        pointsMultiplier: 1,
        scoringProfileId: 1,
        status: "upcoming",
        createdAt: new Date(),
      },
      {
        id: this.nextTournamentId++,
        name: "Master Cup Inverno",
        clubId: 1,
        startDate: new Date("2024-02-10"),
        endDate: new Date("2024-02-12"),
        registrationType: "couple",
        format: "bracket",
        gender: "male",
        level: "advanced",
        maxParticipants: 16,
        pointsMultiplier: 3,
        scoringProfileId: 1,
        status: "completed",
        createdAt: new Date(),
      },
      {
        id: this.nextTournamentId++,
        name: "Ladies Open Round Robin",
        clubId: 2,
        startDate: new Date("2024-03-08"),
        endDate: null,
        registrationType: "couple",
        format: "round_robin",
        gender: "female",
        level: "intermediate",
        maxParticipants: 16,
        pointsMultiplier: 2,
        scoringProfileId: 1,
        status: "in_progress",
        createdAt: new Date(),
      },
    ];
    defaultTournaments.forEach(tournament => this.tournaments.set(tournament.id, tournament));

    // Seed players with bcrypt hashed password (password is "password123" for all)
    // Hash generated with bcrypt.hashSync("password123", 10)
    const seedPasswordHash = "$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lLFN.2jROG";
    const defaultPlayers: Player[] = [
      { id: "player-1", firstName: "Marco", lastName: "Rossi", email: "marco@test.com", password: seedPasswordHash, gender: "male", level: "intermediate", clubId: 1, totalPoints: 150, emailVerified: true, verificationToken: null, createdAt: new Date() },
      { id: "player-2", firstName: "Luca", lastName: "Bianchi", email: "luca@test.com", password: seedPasswordHash, gender: "male", level: "intermediate", clubId: 1, totalPoints: 120, emailVerified: true, verificationToken: null, createdAt: new Date() },
      { id: "player-3", firstName: "Andrea", lastName: "Verdi", email: "andrea@test.com", password: seedPasswordHash, gender: "male", level: "advanced", clubId: 1, totalPoints: 200, emailVerified: true, verificationToken: null, createdAt: new Date() },
      { id: "player-4", firstName: "Giuseppe", lastName: "Ferrari", email: "giuseppe@test.com", password: seedPasswordHash, gender: "male", level: "beginner", clubId: 2, totalPoints: 80, emailVerified: true, verificationToken: null, createdAt: new Date() },
      { id: "player-5", firstName: "Paolo", lastName: "Romano", email: "paolo@test.com", password: seedPasswordHash, gender: "male", level: "intermediate", clubId: 2, totalPoints: 130, emailVerified: true, verificationToken: null, createdAt: new Date() },
      { id: "player-6", firstName: "Matteo", lastName: "Greco", email: "matteo@test.com", password: seedPasswordHash, gender: "male", level: "advanced", clubId: 2, totalPoints: 180, emailVerified: true, verificationToken: null, createdAt: new Date() },
      { id: "player-7", firstName: "Giulia", lastName: "Marino", email: "giulia@test.com", password: seedPasswordHash, gender: "female", level: "intermediate", clubId: 1, totalPoints: 140, emailVerified: true, verificationToken: null, createdAt: new Date() },
      { id: "player-8", firstName: "Francesca", lastName: "Neri", email: "francesca@test.com", password: seedPasswordHash, gender: "female", level: "beginner", clubId: 1, totalPoints: 60, emailVerified: true, verificationToken: null, createdAt: new Date() },
      { id: "player-9", firstName: "Sara", lastName: "Gialli", email: "sara@test.com", password: seedPasswordHash, gender: "female", level: "advanced", clubId: 3, totalPoints: 210, emailVerified: true, verificationToken: null, createdAt: new Date() },
      { id: "player-10", firstName: "Chiara", lastName: "Blu", email: "chiara@test.com", password: seedPasswordHash, gender: "female", level: "intermediate", clubId: 3, totalPoints: 125, emailVerified: true, verificationToken: null, createdAt: new Date() },
      { id: "player-11", firstName: "Elena", lastName: "Rosa", email: "elena@test.com", password: seedPasswordHash, gender: "female", level: "beginner", clubId: 2, totalPoints: 45, emailVerified: true, verificationToken: null, createdAt: new Date() },
      { id: "player-12", firstName: "Valentina", lastName: "Viola", email: "valentina@test.com", password: seedPasswordHash, gender: "female", level: "intermediate", clubId: 3, totalPoints: 110, emailVerified: true, verificationToken: null, createdAt: new Date() },
    ];
    defaultPlayers.forEach(player => this.players.set(player.id, player));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getClubs(): Promise<Club[]> {
    return Array.from(this.clubs.values());
  }

  async getClub(id: number): Promise<Club | undefined> {
    return this.clubs.get(id);
  }

  async createClub(insertClub: InsertClub): Promise<Club> {
    const id = this.nextClubId++;
    const club: Club = { 
      id, 
      name: insertClub.name,
      address: insertClub.address,
      city: insertClub.city,
      courtsCount: insertClub.courtsCount ?? 1,
      createdAt: new Date() 
    };
    this.clubs.set(id, club);
    return club;
  }

  async getScoringProfiles(): Promise<ScoringProfile[]> {
    return Array.from(this.scoringProfiles.values());
  }

  async getScoringProfile(id: number): Promise<ScoringProfile | undefined> {
    return this.scoringProfiles.get(id);
  }

  async getDefaultScoringProfile(): Promise<ScoringProfileWithEntries | undefined> {
    const profile = Array.from(this.scoringProfiles.values()).find(p => p.isDefault);
    if (!profile) return undefined;
    return {
      ...profile,
      entries: this.scoringEntries.get(profile.id) || [],
    };
  }

  async getScoringProfileWithEntries(id: number): Promise<ScoringProfileWithEntries | undefined> {
    const profile = this.scoringProfiles.get(id);
    if (!profile) return undefined;
    return {
      ...profile,
      entries: this.scoringEntries.get(id) || [],
    };
  }

  async createScoringProfile(insertProfile: InsertScoringProfile): Promise<ScoringProfile> {
    const id = this.nextProfileId++;
    const profile: ScoringProfile = { 
      id, 
      name: insertProfile.name,
      isDefault: insertProfile.isDefault ?? false,
      participationPoints: insertProfile.participationPoints ?? 10,
      createdAt: new Date() 
    };
    this.scoringProfiles.set(id, profile);
    return profile;
  }

  async updateScoringProfile(id: number, updates: Partial<InsertScoringProfile>): Promise<ScoringProfile | undefined> {
    const profile = this.scoringProfiles.get(id);
    if (!profile) return undefined;
    const updated = { ...profile, ...updates };
    this.scoringProfiles.set(id, updated);
    return updated;
  }

  async setScoringEntries(profileId: number, entries: { position: number; points: number }[]): Promise<ScoringEntry[]> {
    const scoringEntries: ScoringEntry[] = entries.map((e, index) => ({
      id: this.nextEntryId++,
      profileId,
      position: e.position,
      points: e.points,
    }));
    this.scoringEntries.set(profileId, scoringEntries);
    return scoringEntries;
  }

  async setDefaultProfile(id: number): Promise<void> {
    const entries = Array.from(this.scoringProfiles.entries());
    for (const [profileId, profile] of entries) {
      this.scoringProfiles.set(profileId, { ...profile, isDefault: profileId === id });
    }
  }

  async getMatches(): Promise<Match[]> {
    return Array.from(this.matches.values()).sort((a, b) => 
      new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()
    );
  }

  async getMatchesByPlayer(playerId: string): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(match =>
      match.team1Player1Id === playerId ||
      match.team1Player2Id === playerId ||
      match.team2Player1Id === playerId ||
      match.team2Player2Id === playerId
    ).sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime());
  }

  async getMatchesByClub(clubId: number): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(match => match.clubId === clubId)
      .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime());
  }

  async getMatch(id: number): Promise<Match | undefined> {
    return this.matches.get(id);
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const id = this.nextMatchId++;
    const match: Match = {
      id,
      clubId: insertMatch.clubId,
      playedAt: insertMatch.playedAt ?? new Date(),
      team1Player1Id: insertMatch.team1Player1Id,
      team1Player2Id: insertMatch.team1Player2Id ?? null,
      team2Player1Id: insertMatch.team2Player1Id,
      team2Player2Id: insertMatch.team2Player2Id ?? null,
      set1Team1: insertMatch.set1Team1,
      set1Team2: insertMatch.set1Team2,
      set2Team1: insertMatch.set2Team1,
      set2Team2: insertMatch.set2Team2,
      set3Team1: insertMatch.set3Team1 ?? null,
      set3Team2: insertMatch.set3Team2 ?? null,
      setsPlayed: insertMatch.setsPlayed ?? 2,
      winnerTeam: insertMatch.winnerTeam,
      pointsAwarded: insertMatch.pointsAwarded,
      createdAt: new Date(),
    };
    this.matches.set(id, match);
    return match;
  }

  async calculateMatchPoints(setsPlayed: 2 | 3): Promise<MatchPointsCalculation> {
    const defaultProfile = await this.getDefaultScoringProfile();
    const firstPlaceEntry = defaultProfile?.entries.find(e => e.position === 1);
    const basePoints = firstPlaceEntry?.points ?? 100;
    const divisor = setsPlayed === 2 ? 5 : 6;
    const pointsAwarded = Math.round(basePoints / divisor);
    
    return {
      basePoints,
      setsPlayed,
      divisor,
      pointsAwarded,
    };
  }

  async getTournaments(): Promise<Tournament[]> {
    return Array.from(this.tournaments.values()).sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }

  async getTournament(id: number): Promise<Tournament | undefined> {
    return this.tournaments.get(id);
  }

  async createTournament(insertTournament: InsertTournament): Promise<Tournament> {
    const id = this.nextTournamentId++;
    const tournament: Tournament = {
      id,
      name: insertTournament.name,
      clubId: insertTournament.clubId,
      startDate: insertTournament.startDate,
      endDate: insertTournament.endDate ?? null,
      registrationType: insertTournament.registrationType ?? "couple",
      format: insertTournament.format ?? "bracket",
      gender: insertTournament.gender ?? "mixed",
      level: insertTournament.level ?? "intermediate",
      maxParticipants: insertTournament.maxParticipants ?? 16,
      pointsMultiplier: insertTournament.pointsMultiplier ?? 1.0,
      scoringProfileId: insertTournament.scoringProfileId ?? null,
      status: insertTournament.status ?? "upcoming",
      createdAt: new Date(),
    };
    this.tournaments.set(id, tournament);
    return tournament;
  }

  async updateTournament(id: number, updates: Partial<InsertTournament>): Promise<Tournament | undefined> {
    const tournament = this.tournaments.get(id);
    if (!tournament) return undefined;
    const updated = { ...tournament, ...updates };
    this.tournaments.set(id, updated);
    return updated;
  }

  async getTournamentResults(tournamentId: number): Promise<TournamentResult[]> {
    return this.tournamentResults.get(tournamentId) || [];
  }

  async saveTournamentResults(tournamentId: number, results: InsertTournamentResult[]): Promise<TournamentResult[]> {
    const savedResults: TournamentResult[] = results.map(r => ({
      id: this.nextTournamentResultId++,
      tournamentId,
      position: r.position,
      playerId: r.playerId ?? null,
      player2Id: r.player2Id ?? null,
      basePoints: r.basePoints,
      multiplier: r.multiplier ?? 1.0,
      finalPoints: r.finalPoints,
      createdAt: new Date(),
    }));
    this.tournamentResults.set(tournamentId, savedResults);
    return savedResults;
  }

  async deleteTournamentResults(tournamentId: number): Promise<void> {
    this.tournamentResults.delete(tournamentId);
  }

  async getTournamentRegistrations(tournamentId: number): Promise<TournamentRegistration[]> {
    return Array.from(this.tournamentRegistrations.values())
      .filter(r => r.tournamentId === tournamentId)
      .sort((a, b) => new Date(a.registeredAt!).getTime() - new Date(b.registeredAt!).getTime());
  }

  async getPlayerRegistrations(playerId: string): Promise<TournamentRegistration[]> {
    return Array.from(this.tournamentRegistrations.values())
      .filter(r => r.playerId === playerId || r.partnerId === playerId);
  }

  async getRegistration(tournamentId: number, playerId: string): Promise<TournamentRegistration | undefined> {
    return Array.from(this.tournamentRegistrations.values())
      .find(r => r.tournamentId === tournamentId && (r.playerId === playerId || r.partnerId === playerId));
  }

  async createRegistration(insert: InsertTournamentRegistration): Promise<TournamentRegistration> {
    const id = this.nextRegistrationId++;
    const key = `${insert.tournamentId}-${insert.playerId}`;
    const registration: TournamentRegistration = {
      id,
      tournamentId: insert.tournamentId,
      playerId: insert.playerId,
      partnerId: insert.partnerId ?? null,
      status: insert.status ?? "confirmed",
      registeredAt: new Date(),
    };
    this.tournamentRegistrations.set(key, registration);
    return registration;
  }

  async deleteRegistration(tournamentId: number, playerId: string): Promise<boolean> {
    const registration = await this.getRegistration(tournamentId, playerId);
    if (!registration) return false;
    const key = `${tournamentId}-${registration.playerId}`;
    return this.tournamentRegistrations.delete(key);
  }

  async getTournamentRegistrationsWithPlayers(tournamentId: number): Promise<TournamentRegistrationWithPlayers[]> {
    const registrations = await this.getTournamentRegistrations(tournamentId);
    return Promise.all(registrations.map(async (reg) => {
      const player = await this.getPlayer(reg.playerId);
      const partner = reg.partnerId ? await this.getPlayer(reg.partnerId) : undefined;
      return {
        ...reg,
        player,
        partner,
      };
    }));
  }

  async getPlayers(): Promise<Player[]> {
    return Array.from(this.players.values());
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async createPlayer(insert: InsertPlayer): Promise<Player> {
    const player: Player = {
      id: insert.id,
      firstName: insert.firstName,
      lastName: insert.lastName,
      email: insert.email,
      password: insert.password,
      gender: insert.gender ?? "male",
      level: insert.level ?? "intermediate",
      clubId: insert.clubId ?? null,
      totalPoints: insert.totalPoints ?? 0,
      emailVerified: false,
      verificationToken: null,
      createdAt: new Date(),
    };
    this.players.set(player.id, player);
    return player;
  }

  async updatePlayer(id: string, updates: Partial<InsertPlayer>): Promise<Player | undefined> {
    const player = this.players.get(id);
    if (!player) return undefined;
    const updated: Player = { ...player, ...updates };
    this.players.set(id, updated);
    return updated;
  }

  async getPlayerByEmail(email: string): Promise<Player | undefined> {
    return Array.from(this.players.values()).find(p => p.email === email);
  }

  async getPlayerByVerificationToken(token: string): Promise<Player | undefined> {
    return Array.from(this.players.values()).find(p => p.verificationToken === token);
  }

  async getEligiblePlayersForTournament(gender: string, level: string): Promise<Player[]> {
    return Array.from(this.players.values()).filter(p => {
      const genderMatch = gender === "mixed" || p.gender === gender;
      const levelMatch = p.level === level;
      return genderMatch && levelMatch && p.emailVerified;
    });
  }
}

export const storage = new MemStorage();
