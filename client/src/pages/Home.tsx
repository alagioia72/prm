import { useState } from "react";
import { Link } from "wouter";
import { Trophy, Calendar, Target, TrendingUp, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/StatsCard";
import { TournamentCard, type Tournament } from "@/components/TournamentCard";
import { MatchResultCard, type MatchResult } from "@/components/MatchResultCard";
import { AddMatchDialog } from "@/components/AddMatchDialog";
import { TournamentDetailsDialog } from "@/components/TournamentDetailsDialog";
import { TournamentRegistrationDialog } from "@/components/TournamentRegistrationDialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Tournament as BackendTournament } from "@shared/schema";

interface HomeProps {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  };
}

interface TournamentFromAPI {
  id: number;
  name: string;
  clubId: number;
  startDate: string;
  endDate: string | null;
  registrationType: string;
  format: string;
  gender: string;
  level: string;
  maxParticipants: number;
  pointsMultiplier: number;
  scoringProfileId: number | null;
  status: string;
  createdAt: string;
}

interface ClubFromAPI {
  id: number;
  name: string;
  address: string;
  city: string;
  courtsCount: number;
  rollingWeeks: number | null;
  createdAt: string;
}

interface MatchFromAPI {
  id: number;
  clubId: number;
  playedAt: string;
  team1Player1Id: string;
  team1Player2Id: string | null;
  team2Player1Id: string;
  team2Player2Id: string | null;
  set1Team1: number;
  set1Team2: number;
  set2Team1: number;
  set2Team2: number;
  set3Team1: number | null;
  set3Team2: number | null;
  setsPlayed: number;
  winnerTeam: number;
  pointsAwarded: number;
}

interface PlayerFromAPI {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  level: string;
  clubId: number | null;
  totalPoints: number;
  emailVerified: boolean;
  role: string;
}

export default function Home({ user }: HomeProps) {
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsTournament, setDetailsTournament] = useState<Tournament | null>(null);
  const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false);
  const [registrationTournament, setRegistrationTournament] = useState<BackendTournament | null>(null);

  const { data: tournamentsData = [] } = useQuery<TournamentFromAPI[]>({
    queryKey: ['/api/tournaments'],
  });

  const { data: clubsData = [] } = useQuery<ClubFromAPI[]>({
    queryKey: ['/api/clubs'],
  });

  const { data: matchesData = [] } = useQuery<MatchFromAPI[]>({
    queryKey: ['/api/matches/player', user.id],
  });

  const { data: playersData = [] } = useQuery<PlayerFromAPI[]>({
    queryKey: ['/api/players'],
  });

  const { data: currentPlayer } = useQuery<PlayerFromAPI>({
    queryKey: ['/api/players', user.id],
  });

  const { toast } = useToast();

  const createMatchMutation = useMutation({
    mutationFn: async (data: {
      clubId: number;
      team1Player1Id: string;
      team1Player2Id?: string;
      team2Player1Id: string;
      team2Player2Id?: string;
      set1Team1: number;
      set1Team2: number;
      set2Team1: number;
      set2Team2: number;
      set3Team1?: number;
      set3Team2?: number;
      setsPlayed: number;
      winnerTeam: number;
      pointsAwarded: number;
    }) => {
      return apiRequest('POST', '/api/matches', {
        ...data,
        playedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/matches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/matches/player', user.id] });
      toast({
        title: "Partita registrata",
        description: "La partita è stata salvata con successo",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile registrare la partita",
        variant: "destructive",
      });
    },
  });

  const mapStatus = (status: string): 'open' | 'in_progress' | 'completed' => {
    if (status === 'upcoming' || status === 'open') return 'open';
    if (status === 'in_progress') return 'in_progress';
    return 'completed';
  };

  const tournaments: Tournament[] = tournamentsData
    .filter(t => t.status === 'upcoming' || t.status === 'open')
    .slice(0, 2)
    .map(t => {
      const club = clubsData.find(c => c.id === t.clubId);
      return {
        id: t.id,
        name: t.name,
        date: new Date(t.startDate),
        location: club?.name || "Sede sconosciuta",
        level: t.level as 'beginner' | 'intermediate' | 'advanced',
        gender: t.gender as 'male' | 'female' | 'mixed',
        maxParticipants: t.maxParticipants,
        currentParticipants: 0,
        status: mapStatus(t.status),
        pointsMultiplier: t.pointsMultiplier,
        registrationType: t.registrationType as 'couple' | 'individual',
        format: t.format as 'bracket' | 'round_robin',
      };
    });

  const getPlayerById = (id: string) => {
    return playersData.find(p => p.id === id);
  };

  const matches: MatchResult[] = matchesData.slice(0, 3).map(m => {
    const team1Player1 = getPlayerById(m.team1Player1Id);
    const team1Player2 = m.team1Player2Id ? getPlayerById(m.team1Player2Id) : null;
    const team2Player1 = getPlayerById(m.team2Player1Id);
    const team2Player2 = m.team2Player2Id ? getPlayerById(m.team2Player2Id) : null;
    
    const team1 = [
      { id: 1, firstName: team1Player1?.firstName || "Giocatore", lastName: team1Player1?.lastName || "1", profileImageUrl: null },
    ];
    if (team1Player2) {
      team1.push({ id: 2, firstName: team1Player2.firstName, lastName: team1Player2.lastName, profileImageUrl: null });
    }

    const team2 = [
      { id: 3, firstName: team2Player1?.firstName || "Giocatore", lastName: team2Player1?.lastName || "2", profileImageUrl: null },
    ];
    if (team2Player2) {
      team2.push({ id: 4, firstName: team2Player2.firstName, lastName: team2Player2.lastName, profileImageUrl: null });
    }

    const score1 = [m.set1Team1, m.set2Team1];
    const score2 = [m.set1Team2, m.set2Team2];
    if (m.set3Team1 !== null && m.set3Team2 !== null) {
      score1.push(m.set3Team1);
      score2.push(m.set3Team2);
    }

    return {
      id: m.id,
      date: new Date(m.playedAt),
      type: 'single' as const,
      team1,
      team2,
      score1,
      score2,
      winningSide: m.winnerTeam as 1 | 2,
      pointsAwarded: m.pointsAwarded,
    };
  });

  const playersForDialog = playersData.map(p => ({
    id: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
  }));

  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return "U";
  };

  const playerPoints = currentPlayer?.totalPoints || 0;
  const playerLevel = currentPlayer?.level || "intermediate";

  const levelLabels: Record<string, string> = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzato',
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.profileImageUrl || undefined} className="object-cover" />
              <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-welcome">
                Ciao, {user.firstName || "Giocatore"}!
              </h1>
              <p className="text-muted-foreground">
                Benvenuto nella tua dashboard
              </p>
            </div>
          </div>
          <AddMatchDialog 
            players={playersForDialog}
            onSubmit={(data) => createMatchMutation.mutate(data)}
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard 
            title="Livello"
            value={levelLabels[playerLevel] || playerLevel}
            subtitle="Categoria"
            icon={Trophy}
          />
          <StatsCard 
            title="Punti"
            value={playerPoints}
            icon={Target}
          />
          <StatsCard 
            title="Partite"
            value={matchesData.length}
            icon={Calendar}
          />
          <StatsCard 
            title="Tornei Disponibili"
            value={tournamentsData.filter(t => t.status === 'upcoming' || t.status === 'open').length}
            icon={TrendingUp}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
                <CardTitle>Ultime Partite</CardTitle>
                <Link href="/my-matches">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Vedi Tutte
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {matches.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Non hai ancora giocato partite
                  </p>
                ) : (
                  matches.map((match) => (
                    <MatchResultCard 
                      key={match.id} 
                      match={match} 
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
                <CardTitle>Tornei Disponibili</CardTitle>
                <Link href="/tournaments">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Tutti
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {tournaments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Nessun torneo disponibile
                  </p>
                ) : (
                  tournaments.map((tournament) => (
                    <TournamentCard
                      key={tournament.id}
                      tournament={tournament}
                      isAuthenticated={true}
                      onRegister={(id) => {
                        const apiTournament = tournamentsData.find(t => t.id === id);
                        if (apiTournament) {
                          setRegistrationTournament({
                            id: apiTournament.id,
                            name: apiTournament.name,
                            clubId: apiTournament.clubId,
                            startDate: new Date(apiTournament.startDate),
                            endDate: apiTournament.endDate ? new Date(apiTournament.endDate) : null,
                            registrationType: apiTournament.registrationType as 'couple' | 'individual',
                            format: apiTournament.format as 'bracket' | 'round_robin',
                            gender: apiTournament.gender as 'male' | 'female' | 'mixed',
                            level: apiTournament.level as 'beginner' | 'intermediate' | 'advanced',
                            maxParticipants: apiTournament.maxParticipants,
                            pointsMultiplier: apiTournament.pointsMultiplier,
                            scoringProfileId: apiTournament.scoringProfileId,
                            status: apiTournament.status as 'upcoming' | 'open' | 'in_progress' | 'completed',
                            createdAt: new Date(apiTournament.createdAt),
                          });
                          setRegistrationDialogOpen(true);
                        }
                      }}
                      onViewDetails={(id) => {
                        const t = tournaments.find(t => t.id === id);
                        if (t) {
                          setDetailsTournament(t);
                          setDetailsDialogOpen(true);
                        }
                      }}
                    />
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Il Tuo Profilo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{levelLabels[playerLevel] || playerLevel}</span>
                    <Badge variant="secondary">{playerPoints} pt</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Punti totali</span>
                      <span className="font-medium">{playerPoints}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Partite giocate</span>
                      <span className="font-medium">{matchesData.length}</span>
                    </div>
                  </div>
                  <Link href="/rankings">
                    <Button variant="outline" className="w-full gap-2">
                      <Trophy className="h-4 w-4" />
                      Vedi Classifica Completa
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {detailsTournament && (
        <TournamentDetailsDialog
          tournament={detailsTournament}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
        />
      )}

      {registrationTournament && (
        <TournamentRegistrationDialog
          tournament={registrationTournament}
          isOpen={registrationDialogOpen}
          onOpenChange={setRegistrationDialogOpen}
          currentPlayerId={user.id}
        />
      )}
    </div>
  );
}
