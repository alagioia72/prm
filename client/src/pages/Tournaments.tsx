import { useState } from "react";
import { Calendar, Search, Trophy, Medal, Star, ChevronDown, ChevronUp, Save, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TournamentCard, type Tournament } from "@/components/TournamentCard";
import { CreateTournamentDialog } from "@/components/CreateTournamentDialog";
import { TournamentDetailsDialog } from "@/components/TournamentDetailsDialog";
import { TournamentRegistrationDialog } from "@/components/TournamentRegistrationDialog";
import { Card, CardContent } from "@/components/ui/card";
import type { Tournament as BackendTournament } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ScoringProfileWithEntries } from "@shared/schema";

interface TournamentsProps {
  isAdmin?: boolean;
}

interface Player {
  id: string;
  firstName: string;
  lastName: string;
}

interface RankingEntry {
  position: number;
  playerId: string;
  player2Id?: string;
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

export default function Tournaments({ isAdmin = false }: TournamentsProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [registrationTypeFilter, setRegistrationTypeFilter] = useState<string>("all");
  const [formatFilter, setFormatFilter] = useState<string>("all");
  
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [rankingDialogOpen, setRankingDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsTournament, setDetailsTournament] = useState<Tournament | null>(null);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [positionsCount, setPositionsCount] = useState(8);
  const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false);
  const [registrationTournament, setRegistrationTournament] = useState<BackendTournament | null>(null);
  
  const { toast } = useToast();

  const { data: tournamentsData = [], isLoading: tournamentsLoading } = useQuery<TournamentFromAPI[]>({
    queryKey: ['/api/tournaments'],
  });

  const { data: clubsData = [] } = useQuery<ClubFromAPI[]>({
    queryKey: ['/api/clubs'],
  });

  const { data: playersData = [] } = useQuery<PlayerFromAPI[]>({
    queryKey: ['/api/players'],
  });

  const { data: scoringProfile } = useQuery<ScoringProfileWithEntries>({
    queryKey: ['/api/scoring-profiles/default'],
  });

  const players: Player[] = playersData.map(p => ({
    id: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
  }));

  const mapStatus = (status: string): 'open' | 'in_progress' | 'completed' => {
    if (status === 'upcoming' || status === 'open') return 'open';
    if (status === 'in_progress') return 'in_progress';
    return 'completed';
  };

  const tournaments: Tournament[] = tournamentsData.map(t => {
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

  const saveResultsMutation = useMutation({
    mutationFn: async (data: { tournamentId: number; results: any[] }) => {
      return apiRequest('POST', `/api/tournaments/${data.tournamentId}/results`, data.results);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      if (selectedTournament) {
        queryClient.invalidateQueries({ queryKey: ['/api/tournaments', selectedTournament.id, 'results'] });
      }
      toast({
        title: "Classifica salvata",
        description: "I punti sono stati assegnati ai giocatori",
      });
      setRankingDialogOpen(false);
      setSelectedTournament(null);
      setRankings([]);
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile salvare la classifica",
        variant: "destructive",
      });
    },
  });

  const createTournamentMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      date: string;
      clubId: number;
      level: string;
      gender: string;
      maxParticipants: number;
      pointsMultiplier: number;
      registrationType: string;
      format: string;
    }) => {
      return apiRequest('POST', '/api/tournaments', {
        name: data.name,
        clubId: data.clubId,
        startDate: new Date(data.date).toISOString(),
        registrationType: data.registrationType,
        format: data.format,
        gender: data.gender,
        level: data.level,
        maxParticipants: data.maxParticipants,
        pointsMultiplier: data.pointsMultiplier,
        status: 'upcoming',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      toast({
        title: "Torneo creato",
        description: "Il nuovo torneo è stato creato con successo",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile creare il torneo",
        variant: "destructive",
      });
    },
  });

  const filteredTournaments = tournaments.filter((t) => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (levelFilter !== "all" && t.level !== levelFilter) return false;
    if (genderFilter !== "all" && t.gender !== genderFilter) return false;
    if (registrationTypeFilter !== "all" && t.registrationType !== registrationTypeFilter) return false;
    if (formatFilter !== "all" && t.format !== formatFilter) return false;
    return true;
  });

  const openTournaments = filteredTournaments.filter(t => t.status === 'open');
  const inProgressTournaments = filteredTournaments.filter(t => t.status === 'in_progress');
  const completedTournaments = filteredTournaments.filter(t => t.status === 'completed');

  const handleAssignRanking = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setRankings([]);
    setPositionsCount(8);
    setRankingDialogOpen(true);
  };

  const handleViewDetails = (tournamentId: number) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (tournament) {
      setDetailsTournament(tournament);
      setDetailsDialogOpen(true);
    }
  };

  const handleEditRankingFromDetails = (tournament: Tournament) => {
    setDetailsDialogOpen(false);
    handleAssignRanking(tournament);
  };

  const handleRegister = (tournamentId: number) => {
    const apiTournament = tournamentsData.find(t => t.id === tournamentId);
    if (apiTournament) {
      const backendTournament: BackendTournament = {
        id: apiTournament.id,
        name: apiTournament.name,
        clubId: apiTournament.clubId,
        startDate: new Date(apiTournament.startDate),
        endDate: apiTournament.endDate ? new Date(apiTournament.endDate) : null,
        registrationType: apiTournament.registrationType,
        format: apiTournament.format,
        gender: apiTournament.gender,
        level: apiTournament.level,
        maxParticipants: apiTournament.maxParticipants,
        pointsMultiplier: apiTournament.pointsMultiplier,
        scoringProfileId: apiTournament.scoringProfileId,
        status: apiTournament.status,
        createdAt: new Date(apiTournament.createdAt),
      };
      setRegistrationTournament(backendTournament);
      setRegistrationDialogOpen(true);
    }
  };

  const getPointsForPosition = (position: number): number => {
    if (!scoringProfile) return 0;
    const entry = scoringProfile.entries.find(e => e.position === position);
    if (entry) return entry.points;
    if (position > 16) return scoringProfile.participationPoints;
    return 0;
  };

  const calculateFinalPoints = (basePoints: number): number => {
    if (!selectedTournament) return 0;
    return Math.round(basePoints * selectedTournament.pointsMultiplier);
  };

  const getPositionEntries = () => {
    const entries = [];
    for (let i = 1; i <= positionsCount; i++) {
      const ranking = rankings.find(r => r.position === i);
      const basePoints = getPointsForPosition(i);
      const finalPoints = calculateFinalPoints(basePoints);
      entries.push({
        position: i,
        playerId: ranking?.playerId || "",
        player2Id: ranking?.player2Id || "",
        basePoints,
        finalPoints,
      });
    }
    return entries;
  };

  const handlePlayerSelect = (position: number, playerId: string, isSecondPlayer = false) => {
    setRankings(prev => {
      const existing = prev.find(r => r.position === position);
      if (existing) {
        return prev.map(r => {
          if (r.position === position) {
            return isSecondPlayer 
              ? { ...r, player2Id: playerId }
              : { ...r, playerId };
          }
          return r;
        });
      }
      return [...prev, { 
        position, 
        playerId: isSecondPlayer ? "" : playerId,
        player2Id: isSecondPlayer ? playerId : undefined,
      }];
    });
  };

  const getUsedPlayerIds = (): Set<string> => {
    const used = new Set<string>();
    rankings.forEach(r => {
      if (r.playerId) used.add(r.playerId);
      if (r.player2Id) used.add(r.player2Id);
    });
    return used;
  };

  const getAvailablePlayers = (currentPosition: number, isSecondPlayer = false): Player[] => {
    const usedIds = getUsedPlayerIds();
    const currentRanking = rankings.find(r => r.position === currentPosition);
    
    return players.filter(p => {
      if (usedIds.has(p.id)) {
        if (isSecondPlayer && currentRanking?.playerId === p.id) return false;
        if (!isSecondPlayer && currentRanking?.player2Id === p.id) return false;
        if (currentRanking?.playerId === p.id || currentRanking?.player2Id === p.id) return true;
        return false;
      }
      return true;
    });
  };

  const handleSaveRanking = () => {
    if (!selectedTournament) return;
    
    const validRankings = rankings.filter(r => r.playerId);
    if (validRankings.length === 0) {
      toast({
        title: "Errore",
        description: "Seleziona almeno un giocatore per la classifica",
        variant: "destructive",
      });
      return;
    }

    const results = validRankings.map(r => {
      const basePoints = getPointsForPosition(r.position);
      const finalPoints = calculateFinalPoints(basePoints);
      return {
        position: r.position,
        playerId: r.playerId,
        player2Id: selectedTournament.registrationType === 'couple' ? r.player2Id : undefined,
        basePoints,
        multiplier: selectedTournament.pointsMultiplier,
        finalPoints,
      };
    });

    saveResultsMutation.mutate({ tournamentId: selectedTournament.id, results });
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-medium text-muted-foreground">{position}</span>;
    }
  };

  const isCoupleTournament = selectedTournament?.registrationType === 'couple';

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-page-title">
              <Calendar className="h-8 w-8 text-primary" />
              Tornei
            </h1>
            <p className="text-muted-foreground mt-1">
              Esplora e iscriviti ai tornei disponibili
            </p>
          </div>
          {isAdmin && (
            <CreateTournamentDialog 
              clubs={clubsData.map(c => ({ id: c.id, name: c.name }))}
              onSubmit={(data) => createTournamentMutation.mutate(data)}
            />
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca tornei..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              data-testid="input-search-tournaments"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[140px]" data-testid="select-level-filter">
                <SelectValue placeholder="Livello" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i livelli</SelectItem>
                <SelectItem value="beginner">Principiante</SelectItem>
                <SelectItem value="intermediate">Intermedio</SelectItem>
                <SelectItem value="advanced">Avanzato</SelectItem>
              </SelectContent>
            </Select>
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="w-[140px]" data-testid="select-gender-filter">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte</SelectItem>
                <SelectItem value="male">Maschile</SelectItem>
                <SelectItem value="female">Femminile</SelectItem>
                <SelectItem value="mixed">Misto</SelectItem>
              </SelectContent>
            </Select>
            <Select value={registrationTypeFilter} onValueChange={setRegistrationTypeFilter}>
              <SelectTrigger className="w-[140px]" data-testid="select-registration-type-filter">
                <SelectValue placeholder="Iscrizione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte</SelectItem>
                <SelectItem value="couple">A Coppia</SelectItem>
                <SelectItem value="individual">Individuale</SelectItem>
              </SelectContent>
            </Select>
            <Select value={formatFilter} onValueChange={setFormatFilter}>
              <SelectTrigger className="w-[140px]" data-testid="select-format-filter">
                <SelectValue placeholder="Formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti</SelectItem>
                <SelectItem value="bracket">Tabellone</SelectItem>
                <SelectItem value="round_robin">Tutti vs Tutti</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {tournamentsLoading ? (
          <div className="text-center py-16 text-muted-foreground">
            Caricamento tornei...
          </div>
        ) : tournaments.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nessun torneo</h3>
              <p className="text-muted-foreground">
                Non ci sono ancora tornei registrati nel sistema.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="open" className="space-y-6">
            <TabsList>
              <TabsTrigger value="open" className="gap-2" data-testid="tab-open">
                Iscrizioni Aperte
                <Badge variant="secondary">{openTournaments.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="in_progress" className="gap-2" data-testid="tab-in-progress">
                In Corso
                <Badge variant="secondary">{inProgressTournaments.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="completed" className="gap-2" data-testid="tab-completed">
                Conclusi
                <Badge variant="secondary">{completedTournaments.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="open">
              {openTournaments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {openTournaments.map((tournament) => (
                    <TournamentCard
                      key={tournament.id}
                      tournament={tournament}
                      onRegister={handleRegister}
                      onViewDetails={handleViewDetails}
                      isAdmin={isAdmin}
                      onAssignRanking={handleAssignRanking}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  Nessun torneo con iscrizioni aperte
                </div>
              )}
            </TabsContent>

            <TabsContent value="in_progress">
              {inProgressTournaments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inProgressTournaments.map((tournament) => (
                    <TournamentCard
                      key={tournament.id}
                      tournament={tournament}
                      onViewDetails={handleViewDetails}
                      isAdmin={isAdmin}
                      onAssignRanking={handleAssignRanking}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  Nessun torneo in corso
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed">
              {completedTournaments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedTournaments.map((tournament) => (
                    <TournamentCard
                      key={tournament.id}
                      tournament={tournament}
                      onViewDetails={handleViewDetails}
                      isAdmin={isAdmin}
                      onAssignRanking={handleAssignRanking}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  Nessun torneo concluso
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <Dialog open={rankingDialogOpen} onOpenChange={setRankingDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Classifica Finale - {selectedTournament?.name}
            </DialogTitle>
            <DialogDescription>
              Assegna le posizioni finali ai {isCoupleTournament ? "coppie" : "giocatori"}. I punti vengono calcolati automaticamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4" />
                Moltiplicatore: <Badge variant="secondary">{selectedTournament?.pointsMultiplier}x</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Posizioni:</span>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setPositionsCount(Math.max(4, positionsCount - 1))}
                    disabled={positionsCount <= 4}
                    data-testid="button-decrease-positions"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Badge variant="secondary" className="min-w-[2rem] justify-center">
                    {positionsCount}
                  </Badge>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setPositionsCount(Math.min(16, positionsCount + 1))}
                    disabled={positionsCount >= 16}
                    data-testid="button-increase-positions"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {getPositionEntries().map((entry) => (
                  <Card key={entry.position} className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 min-w-[3rem]">
                        {getPositionIcon(entry.position)}
                      </div>

                      <div className="flex-1 flex items-center gap-2">
                        {isCoupleTournament ? (
                          <>
                            <Select
                              value={entry.playerId}
                              onValueChange={(value) => handlePlayerSelect(entry.position, value, false)}
                            >
                              <SelectTrigger className="flex-1" data-testid={`select-position-${entry.position}-player1`}>
                                <SelectValue placeholder="Giocatore 1" />
                              </SelectTrigger>
                              <SelectContent>
                                {getAvailablePlayers(entry.position, false).map((player) => (
                                  <SelectItem key={player.id} value={player.id}>
                                    {player.firstName} {player.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <Select
                              value={entry.player2Id}
                              onValueChange={(value) => handlePlayerSelect(entry.position, value, true)}
                            >
                              <SelectTrigger className="flex-1" data-testid={`select-position-${entry.position}-player2`}>
                                <SelectValue placeholder="Giocatore 2" />
                              </SelectTrigger>
                              <SelectContent>
                                {getAvailablePlayers(entry.position, true).map((player) => (
                                  <SelectItem key={player.id} value={player.id}>
                                    {player.firstName} {player.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </>
                        ) : (
                          <Select
                            value={entry.playerId}
                            onValueChange={(value) => handlePlayerSelect(entry.position, value, false)}
                          >
                            <SelectTrigger className="flex-1" data-testid={`select-position-${entry.position}`}>
                              <SelectValue placeholder="Seleziona giocatore" />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailablePlayers(entry.position, false).map((player) => (
                                <SelectItem key={player.id} value={player.id}>
                                  {player.firstName} {player.lastName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      <div className="flex items-center gap-2 min-w-[4rem] text-right">
                        <Badge variant="outline" className="font-mono">
                          {entry.finalPoints} pt
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setRankingDialogOpen(false)}>
                Annulla
              </Button>
              <Button onClick={handleSaveRanking} disabled={saveResultsMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Salva Classifica
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {detailsTournament && (
        <TournamentDetailsDialog
          tournament={detailsTournament}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          isAdmin={isAdmin}
          onEditRanking={handleEditRankingFromDetails}
        />
      )}

      {registrationTournament && (
        <TournamentRegistrationDialog
          tournament={registrationTournament}
          currentPlayerId=""
          isOpen={registrationDialogOpen}
          onOpenChange={setRegistrationDialogOpen}
        />
      )}
    </div>
  );
}
