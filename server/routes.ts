import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClubSchema, insertScoringProfileSchema, insertMatchSchema, insertTournamentSchema, insertTournamentResultSchema, registerPlayerSchema, loginSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { sendVerificationEmail, sendTournamentNotification } from "./email";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Initialize default data (admin account, scoring profile)
  await storage.initializeDefaults();

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

  app.patch("/api/clubs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateSchema = z.object({
        name: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        courtsCount: z.number().optional(),
        rollingWeeks: z.number().nullable().optional(),
      });
      const updates = updateSchema.parse(req.body);
      const club = await storage.updateClub(id, updates);
      if (!club) {
        return res.status(404).json({ error: "Club not found" });
      }
      res.json(club);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/clubs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteClub(id);
      if (!deleted) {
        return res.status(404).json({ error: "Club not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/chain-settings", async (req, res) => {
    const settings = await storage.getChainSettings();
    res.json(settings);
  });

  app.get("/api/chain-settings/:key", async (req, res) => {
    const setting = await storage.getChainSetting(req.params.key);
    if (!setting) {
      return res.status(404).json({ error: "Setting not found" });
    }
    res.json(setting);
  });

  app.put("/api/chain-settings/:key", async (req, res) => {
    try {
      const settingSchema = z.object({
        value: z.string(),
        description: z.string().optional(),
      });
      const data = settingSchema.parse(req.body);
      const setting = await storage.setChainSetting({
        key: req.params.key,
        value: data.value,
        description: data.description,
      });
      res.json(setting);
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

  app.get("/api/tournaments", async (req, res) => {
    const tournaments = await storage.getTournaments();
    res.json(tournaments);
  });

  app.get("/api/tournaments/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const tournament = await storage.getTournament(id);
    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }
    res.json(tournament);
  });

  app.post("/api/tournaments", async (req, res) => {
    try {
      const data = insertTournamentSchema.parse(req.body);
      const tournament = await storage.createTournament(data);
      
      const eligiblePlayers = await storage.getEligiblePlayersForTournament(
        tournament.gender,
        tournament.level
      );
      
      const emailPromises = eligiblePlayers.map(player => 
        sendTournamentNotification(
          player.email,
          player.firstName,
          tournament.name,
          tournament.startDate,
          tournament.gender,
          tournament.level
        ).catch(err => {
          console.error(`Failed to send email to ${player.email}:`, err);
          return false;
        })
      );
      
      Promise.all(emailPromises).then(results => {
        const sentCount = results.filter(Boolean).length;
        console.log(`Tournament ${tournament.name}: Sent ${sentCount}/${eligiblePlayers.length} notification emails`);
      });
      
      res.status(201).json(tournament);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/tournaments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingTournament = await storage.getTournament(id);
      if (!existingTournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }
      
      const updates: any = { ...req.body };
      if (updates.startDate) {
        updates.startDate = new Date(updates.startDate);
      }
      if (updates.endDate) {
        updates.endDate = new Date(updates.endDate);
      }
      
      const tournament = await storage.updateTournament(id, updates);
      res.json(tournament);
    } catch (error) {
      console.error("Error updating tournament:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/tournaments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tournament = await storage.getTournament(id);
      if (!tournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }
      const deleted = await storage.deleteTournament(id);
      if (deleted) {
        res.json({ success: true, message: "Tournament deleted successfully" });
      } else {
        res.status(500).json({ error: "Failed to delete tournament" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/tournaments/:id/results", async (req, res) => {
    const id = parseInt(req.params.id);
    const results = await storage.getTournamentResults(id);
    res.json(results);
  });

  app.post("/api/tournaments/:id/results", async (req, res) => {
    try {
      const tournamentId = parseInt(req.params.id);
      const tournament = await storage.getTournament(tournamentId);
      if (!tournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }

      const resultsSchema = z.array(z.object({
        position: z.number().min(1),
        playerId: z.string().optional(),
        player2Id: z.string().optional(),
        basePoints: z.number().min(0),
        multiplier: z.number().min(0),
        finalPoints: z.number().min(0),
      }));
      
      const resultsData = resultsSchema.parse(req.body);
      
      await storage.deleteTournamentResults(tournamentId);
      
      const insertResults = resultsData.map(r => ({
        tournamentId,
        position: r.position,
        playerId: r.playerId,
        player2Id: r.player2Id,
        basePoints: r.basePoints,
        multiplier: r.multiplier,
        finalPoints: r.finalPoints,
      }));
      
      const results = await storage.saveTournamentResults(tournamentId, insertResults);
      
      await storage.updateTournament(tournamentId, { status: "completed" });
      
      res.status(201).json(results);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/tournaments/:id/results", async (req, res) => {
    try {
      const tournamentId = parseInt(req.params.id);
      await storage.deleteTournamentResults(tournamentId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/tournaments/:id/registrations", async (req, res) => {
    const tournamentId = parseInt(req.params.id);
    const withPlayers = req.query.withPlayers === 'true';
    if (withPlayers) {
      const registrations = await storage.getTournamentRegistrationsWithPlayers(tournamentId);
      res.json(registrations);
    } else {
      const registrations = await storage.getTournamentRegistrations(tournamentId);
      res.json(registrations);
    }
  });

  app.post("/api/tournaments/:id/register", async (req, res) => {
    try {
      const tournamentId = parseInt(req.params.id);
      const tournament = await storage.getTournament(tournamentId);
      if (!tournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }

      if (tournament.status !== "upcoming") {
        return res.status(400).json({ error: "Il torneo non è aperto alle iscrizioni" });
      }

      const registrationSchema = z.object({
        playerId: z.string().min(1),
        partnerId: z.string().optional(),
      });
      
      const data = registrationSchema.parse(req.body);

      const player = await storage.getPlayer(data.playerId);
      if (!player) {
        return res.status(404).json({ error: "Giocatore non trovato" });
      }

      if (tournament.gender !== "mixed" && player.gender !== tournament.gender) {
        const genderLabel = tournament.gender === "male" ? "maschile" : "femminile";
        return res.status(400).json({ error: `Questo torneo è riservato a giocatori di categoria ${genderLabel}` });
      }

      if (player.level !== tournament.level) {
        const levelLabel = tournament.level === "beginner" ? "principianti" : 
                          tournament.level === "intermediate" ? "intermedi" : "avanzati";
        return res.status(400).json({ error: `Questo torneo è riservato a giocatori di livello ${levelLabel}` });
      }

      if (data.partnerId) {
        const partner = await storage.getPlayer(data.partnerId);
        if (!partner) {
          return res.status(404).json({ error: "Partner non trovato" });
        }

        if (tournament.gender !== "mixed" && partner.gender !== tournament.gender) {
          const genderLabel = tournament.gender === "male" ? "maschile" : "femminile";
          return res.status(400).json({ error: `Il partner deve essere di categoria ${genderLabel}` });
        }

        if (partner.level !== tournament.level) {
          const levelLabel = tournament.level === "beginner" ? "principianti" : 
                            tournament.level === "intermediate" ? "intermedi" : "avanzati";
          return res.status(400).json({ error: `Il partner deve essere di livello ${levelLabel}` });
        }
      }

      const existing = await storage.getRegistration(tournamentId, data.playerId);
      if (existing) {
        return res.status(400).json({ error: "Sei già iscritto a questo torneo" });
      }

      if (data.partnerId) {
        const partnerExisting = await storage.getRegistration(tournamentId, data.partnerId);
        if (partnerExisting) {
          return res.status(400).json({ error: "Il partner è già iscritto a questo torneo" });
        }
      }

      const currentRegistrations = await storage.getTournamentRegistrations(tournamentId);
      if (currentRegistrations.length >= tournament.maxParticipants) {
        return res.status(400).json({ error: "Il torneo è al completo" });
      }

      const registration = await storage.createRegistration({
        tournamentId,
        playerId: data.playerId,
        partnerId: data.partnerId,
        status: "confirmed",
      });

      res.status(201).json(registration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/tournaments/:id/register/:playerId", async (req, res) => {
    try {
      const tournamentId = parseInt(req.params.id);
      const playerId = req.params.playerId;
      
      const tournament = await storage.getTournament(tournamentId);
      if (!tournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }

      if (tournament.status !== "upcoming") {
        return res.status(400).json({ error: "Cannot unregister from a tournament that has started" });
      }

      const success = await storage.deleteRegistration(tournamentId, playerId);
      if (!success) {
        return res.status(404).json({ error: "Registration not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/players/:playerId/registrations", async (req, res) => {
    const registrations = await storage.getPlayerRegistrations(req.params.playerId);
    res.json(registrations);
  });

  app.get("/api/players", async (req, res) => {
    const players = await storage.getPlayers();
    const safePlayers = players.map(({ password, verificationToken, ...safe }) => safe);
    res.json(safePlayers);
  });

  app.get("/api/players/:id", async (req, res) => {
    const player = await storage.getPlayer(req.params.id);
    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }
    const { password, verificationToken, ...safePlayer } = player;
    res.json(safePlayer);
  });

  app.patch("/api/players/:id/role", async (req, res) => {
    try {
      const { role, adminId } = req.body;
      
      if (!adminId) {
        return res.status(401).json({ error: "Autenticazione richiesta" });
      }
      
      const adminUser = await storage.getPlayer(adminId);
      if (!adminUser || adminUser.role !== "admin") {
        return res.status(403).json({ error: "Solo gli amministratori possono modificare i ruoli" });
      }
      
      if (!role || !["player", "admin"].includes(role)) {
        return res.status(400).json({ error: "Ruolo non valido. Usa 'player' o 'admin'" });
      }
      
      const player = await storage.getPlayer(req.params.id);
      if (!player) {
        return res.status(404).json({ error: "Giocatore non trovato" });
      }
      
      const updated = await storage.updatePlayer(req.params.id, { role } as any);
      if (!updated) {
        return res.status(500).json({ error: "Errore durante l'aggiornamento" });
      }
      
      const { password, verificationToken, ...safePlayer } = updated;
      res.json(safePlayer);
    } catch (error) {
      res.status(500).json({ error: "Errore interno del server" });
    }
  });

  app.patch("/api/players/:id", async (req, res) => {
    try {
      const updateSchema = z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        gender: z.enum(["male", "female"]).optional(),
        level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        clubId: z.number().nullable().optional(),
      });
      const updates = updateSchema.parse(req.body);
      
      const player = await storage.getPlayer(req.params.id);
      if (!player) {
        return res.status(404).json({ error: "Giocatore non trovato" });
      }
      
      const updated = await storage.updatePlayer(req.params.id, updates);
      if (!updated) {
        return res.status(500).json({ error: "Errore durante l'aggiornamento" });
      }
      
      const { password, verificationToken, ...safePlayer } = updated;
      res.json(safePlayer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Errore interno del server" });
    }
  });

  app.delete("/api/players/:id", async (req, res) => {
    try {
      const player = await storage.getPlayer(req.params.id);
      if (!player) {
        return res.status(404).json({ error: "Giocatore non trovato" });
      }
      
      const deleted = await storage.deletePlayer(req.params.id);
      if (!deleted) {
        return res.status(500).json({ error: "Errore durante l'eliminazione" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Errore interno del server" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerPlayerSchema.parse(req.body);
      
      const existingPlayer = await storage.getPlayerByEmail(data.email);
      if (existingPlayer) {
        return res.status(400).json({ error: "Email già registrata" });
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const verificationToken = randomUUID();
      const playerId = `player-${randomUUID().slice(0, 8)}`;

      const player = await storage.createPlayer({
        id: playerId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
        gender: data.gender,
        level: data.level,
        clubId: data.clubId ?? null,
        totalPoints: 0,
      });

      await storage.updatePlayer(player.id, { verificationToken } as any);

      const emailSent = await sendVerificationEmail(data.email, data.firstName, verificationToken);
      
      const { password: _, verificationToken: __, ...safePlayer } = player;
      res.status(201).json({ 
        ...safePlayer, 
        emailSent,
        message: emailSent 
          ? "Registrazione completata! Controlla la tua email per verificare l'account." 
          : "Registrazione completata! Email di verifica non inviata - contatta l'amministratore."
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ error: "Errore durante la registrazione" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const player = await storage.getPlayerByEmail(data.email);
      if (!player) {
        return res.status(401).json({ error: "Credenziali non valide" });
      }

      const validPassword = await bcrypt.compare(data.password, player.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Credenziali non valide" });
      }

      if (!player.emailVerified) {
        return res.status(403).json({ error: "Email non verificata. Controlla la tua casella di posta." });
      }

      const { password: _, verificationToken: __, ...safePlayer } = player;
      res.json({ 
        ...safePlayer,
        message: "Login effettuato con successo"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Errore durante il login" });
    }
  });

  app.get("/api/auth/verify-email", async (req, res) => {
    try {
      const token = req.query.token as string;
      if (!token) {
        return res.status(400).json({ error: "Token mancante" });
      }

      const player = await storage.getPlayerByVerificationToken(token);
      if (!player) {
        return res.status(400).json({ error: "Token non valido o scaduto" });
      }

      await storage.updatePlayer(player.id, { 
        emailVerified: true, 
        verificationToken: null 
      } as any);

      res.json({ message: "Email verificata con successo! Ora puoi accedere." });
    } catch (error) {
      res.status(500).json({ error: "Errore durante la verifica" });
    }
  });

  app.get("/api/rankings", async (req, res) => {
    try {
      const gender = req.query.gender as string | undefined;
      const level = req.query.level as string | undefined;
      const clubId = req.query.clubId ? parseInt(req.query.clubId as string) : undefined;

      let rollingWeeks: number | null = null;

      if (clubId) {
        const club = await storage.getClub(clubId);
        if (club && club.rollingWeeks !== null && club.rollingWeeks !== undefined) {
          rollingWeeks = club.rollingWeeks === 0 ? null : club.rollingWeeks;
        } else {
          const chainSetting = await storage.getChainSetting('rollingWeeks');
          if (chainSetting && chainSetting.value !== '0') {
            rollingWeeks = parseInt(chainSetting.value);
          }
        }
      } else {
        const chainSetting = await storage.getChainSetting('rollingWeeks');
        if (chainSetting && chainSetting.value !== '0') {
          rollingWeeks = parseInt(chainSetting.value);
        }
      }

      const cutoffDate = rollingWeeks 
        ? new Date(Date.now() - rollingWeeks * 7 * 24 * 60 * 60 * 1000) 
        : null;

      const players = await storage.getPlayers();
      const tournaments = await storage.getTournaments();
      const matches = await storage.getMatches();

      const playerPoints: Record<string, number> = {};

      players.forEach(player => {
        if (gender && player.gender !== gender) return;
        if (level && player.level !== level) return;
        if (clubId && player.clubId !== clubId) return;
        playerPoints[player.id] = 0;
      });

      for (const tournament of tournaments) {
        if (tournament.status !== 'completed') continue;
        const tournamentDate = tournament.endDate || tournament.startDate;
        if (cutoffDate && new Date(tournamentDate) < cutoffDate) continue;

        const results = await storage.getTournamentResults(tournament.id);
        for (const result of results) {
          if (result.playerId && playerPoints[result.playerId] !== undefined) {
            playerPoints[result.playerId] += result.finalPoints;
          }
          if (result.player2Id && playerPoints[result.player2Id] !== undefined) {
            playerPoints[result.player2Id] += result.finalPoints;
          }
        }
      }

      for (const match of matches) {
        if (cutoffDate && new Date(match.playedAt) < cutoffDate) continue;

        const winnerPlayers = match.winnerTeam === 1 
          ? [match.team1Player1Id, match.team1Player2Id]
          : [match.team2Player1Id, match.team2Player2Id];

        winnerPlayers.forEach(playerId => {
          if (playerId && playerPoints[playerId] !== undefined) {
            playerPoints[playerId] += match.pointsAwarded;
          }
        });
      }

      const rankings = Object.entries(playerPoints)
        .map(([playerId, points]) => {
          const player = players.find(p => p.id === playerId);
          return {
            playerId,
            firstName: player?.firstName || '',
            lastName: player?.lastName || '',
            gender: player?.gender || '',
            level: player?.level || '',
            clubId: player?.clubId,
            points,
          };
        })
        .sort((a, b) => b.points - a.points)
        .map((entry, index) => ({ ...entry, position: index + 1 }));

      res.json({
        rankings,
        rollingWeeks: rollingWeeks || null,
        cutoffDate: cutoffDate?.toISOString() || null,
      });
    } catch (error) {
      console.error('Error calculating rankings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post("/api/auth/resend-verification", async (req, res) => {
    try {
      const emailSchema = z.object({ email: z.string().email() });
      const { email } = emailSchema.parse(req.body);

      const player = await storage.getPlayerByEmail(email);
      if (!player) {
        return res.status(404).json({ error: "Email non trovata" });
      }

      if (player.emailVerified) {
        return res.status(400).json({ error: "Email già verificata" });
      }

      const newToken = randomUUID();
      await storage.updatePlayer(player.id, { verificationToken: newToken } as any);

      const emailSent = await sendVerificationEmail(email, player.firstName, newToken);
      
      res.json({ 
        success: emailSent,
        message: emailSent 
          ? "Email di verifica inviata!" 
          : "Impossibile inviare l'email - riprova più tardi."
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Errore durante l'invio" });
    }
  });

  return httpServer;
}
