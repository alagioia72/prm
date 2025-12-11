import { useState, useMemo } from "react";
import { Trophy, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchResultCard, type MatchResult } from "@/components/MatchResultCard";
import { AddMatchDialog } from "@/components/AddMatchDialog";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Match } from "@shared/schema";

const mockPlayers = [
  { id: "player-1", firstName: "Marco", lastName: "Rossi" },
  { id: "player-2", firstName: "Luca", lastName: "Bianchi" },
  { id: "player-3", firstName: "Andrea", lastName: "Verdi" },
  { id: "player-4", firstName: "Giuseppe", lastName: "Ferrari" },
  { id: "player-5", firstName: "Paolo", lastName: "Romano" },
  { id: "player-6", firstName: "Matteo", lastName: "Greco" },
];

const playerMap = new Map(mockPlayers.map(p => [p.id, p]));

function transformApiMatch(match: Match): MatchResult {
  const getPlayer = (id: string | null) => {
    if (!id) return null;
    const player = playerMap.get(id);
    if (player) return { id: parseInt(id.replace('player-', '')) || 0, firstName: player.firstName, lastName: player.lastName, profileImageUrl: null };
    return { id: 0, firstName: id.slice(0, 5), lastName: "...", profileImageUrl: null };
  };

  const team1: { id: number; firstName: string; lastName: string; profileImageUrl: string | null }[] = [];
  const team2: { id: number; firstName: string; lastName: string; profileImageUrl: string | null }[] = [];

  const p1 = getPlayer(match.team1Player1Id);
  if (p1) team1.push(p1);
  const p2 = getPlayer(match.team1Player2Id);
  if (p2) team1.push(p2);
  const p3 = getPlayer(match.team2Player1Id);
  if (p3) team2.push(p3);
  const p4 = getPlayer(match.team2Player2Id);
  if (p4) team2.push(p4);

  const score1: number[] = [match.set1Team1, match.set2Team1];
  const score2: number[] = [match.set1Team2, match.set2Team2];
  
  if (match.setsPlayed === 3 && match.set3Team1 !== null && match.set3Team2 !== null) {
    score1.push(match.set3Team1);
    score2.push(match.set3Team2);
  }

  return {
    id: match.id,
    date: new Date(match.playedAt),
    type: 'single',
    team1,
    team2,
    score1,
    score2,
    winningSide: match.winnerTeam as 1 | 2,
    pointsAwarded: match.pointsAwarded,
  };
}

export default function MyMatches() {
  const [filter, setFilter] = useState<'all' | 'tournament' | 'single'>('all');
  const { toast } = useToast();

  const { data: apiMatches = [], isLoading } = useQuery<Match[]>({
    queryKey: ['/api/matches'],
  });

  const matches: MatchResult[] = useMemo(() => {
    return apiMatches.map(transformApiMatch);
  }, [apiMatches]);

  const createMatchMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/matches', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/matches'] });
      toast({
        title: "Partita registrata",
        description: "La partita è stata salvata con successo",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile salvare la partita",
        variant: "destructive",
      });
    },
  });

  const handleMatchSubmit = (data: any) => {
    createMatchMutation.mutate(data);
  };

  const filteredMatches = matches.filter(match => {
    if (filter === 'all') return true;
    return match.type === filter;
  });

  const tournamentMatches = matches.filter(m => m.type === 'tournament');
  const singleMatches = matches.filter(m => m.type === 'single');

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-page-title">
              <Trophy className="h-8 w-8 text-primary" />
              Le Mie Partite
            </h1>
            <p className="text-muted-foreground mt-1">
              Storico delle tue partite giocate
            </p>
          </div>
          <AddMatchDialog 
            players={mockPlayers}
            onSubmit={handleMatchSubmit}
          />
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'tournament' | 'single')} className="space-y-6">
          <TabsList>
            <TabsTrigger value="all" className="gap-2" data-testid="tab-all-matches">
              Tutte
              <Badge variant="secondary">{matches.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="tournament" className="gap-2" data-testid="tab-tournament-matches">
              Tornei
              <Badge variant="secondary">{tournamentMatches.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="single" className="gap-2" data-testid="tab-single-matches">
              Singole
              <Badge variant="secondary">{singleMatches.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredMatches.length > 0 ? (
              filteredMatches.map((match) => (
                <MatchResultCard 
                  key={match.id} 
                  match={match}
                />
              ))
            ) : (
              <div className="text-center py-16 text-muted-foreground" data-testid="text-no-matches">
                {matches.length === 0 
                  ? "Nessuna partita registrata. Usa il pulsante 'Aggiungi Partita' per registrare la tua prima partita!"
                  : "Nessuna partita trovata per questo filtro"
                }
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
