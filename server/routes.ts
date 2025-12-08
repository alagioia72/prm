import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClubSchema, insertScoringProfileSchema, insertMatchSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/clubs", async (req, res) => {
    const clubs = await storage.getClubs();
    res.json(clubs);
  });

  app.get("/api/clubs/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const club = await storage.getClub(id);
    if (!club) {
      return res.status(404).json({ error: "Club not found" });
    }
    res.json(club);
  });

  app.post("/api/clubs", async (req, res) => {
    try {
      const data = insertClubSchema.parse(req.body);
      const club = await storage.createClub(data);
      res.status(201).json(club);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/scoring-profiles", async (req, res) => {
    const profiles = await storage.getScoringProfiles();
    res.json(profiles);
  });

  app.get("/api/scoring-profiles/default", async (req, res) => {
    const profile = await storage.getDefaultScoringProfile();
    if (!profile) {
      return res.status(404).json({ error: "No default profile found" });
    }
    res.json(profile);
  });

  app.get("/api/scoring-profiles/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const profile = await storage.getScoringProfileWithEntries(id);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json(profile);
  });

  app.post("/api/scoring-profiles", async (req, res) => {
    try {
      const data = insertScoringProfileSchema.parse(req.body);
      const profile = await storage.createScoringProfile(data);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/scoring-profiles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const profile = await storage.updateScoringProfile(id, updates);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/scoring-profiles/:id/entries", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const entriesSchema = z.array(z.object({
        position: z.number().min(1).max(16),
        points: z.number().min(0),
      }));
      const entries = entriesSchema.parse(req.body);
      const savedEntries = await storage.setScoringEntries(id, entries);
      res.json(savedEntries);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/scoring-profiles/:id/set-default", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.setDefaultProfile(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/matches", async (req, res) => {
    const matches = await storage.getMatches();
    res.json(matches);
  });

  app.get("/api/matches/player/:playerId", async (req, res) => {
    const matches = await storage.getMatchesByPlayer(req.params.playerId);
    res.json(matches);
  });

  app.get("/api/matches/club/:clubId", async (req, res) => {
    const clubId = parseInt(req.params.clubId);
    const matches = await storage.getMatchesByClub(clubId);
    res.json(matches);
  });

  app.get("/api/matches/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const match = await storage.getMatch(id);
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }
    res.json(match);
  });

  app.get("/api/matches/calculate-points/:sets", async (req, res) => {
    const sets = parseInt(req.params.sets);
    if (sets !== 2 && sets !== 3) {
      return res.status(400).json({ error: "Sets must be 2 or 3" });
    }
    const calculation = await storage.calculateMatchPoints(sets as 2 | 3);
    res.json(calculation);
  });

  app.post("/api/matches", async (req, res) => {
    try {
      const data = insertMatchSchema.parse(req.body);
      const match = await storage.createMatch(data);
      res.status(201).json(match);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return httpServer;
}
