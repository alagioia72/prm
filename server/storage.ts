import { type User, type InsertUser, type ScoringProfile, type InsertScoringProfile, type ScoringEntry, type InsertScoringEntry, type ScoringProfileWithEntries, type Club, type InsertClub } from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private clubs: Map<number, Club>;
  private scoringProfiles: Map<number, ScoringProfile>;
  private scoringEntries: Map<number, ScoringEntry[]>;
  private nextClubId = 1;
  private nextProfileId = 1;
  private nextEntryId = 1;

  constructor() {
    this.users = new Map();
    this.clubs = new Map();
    this.scoringProfiles = new Map();
    this.scoringEntries = new Map();
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
}

export const storage = new MemStorage();
