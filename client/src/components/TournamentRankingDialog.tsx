import { useState, useMemo } from "react";
import { Trophy, Medal, Star, Users, User, ChevronDown, ChevronUp, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ScoringProfileWithEntries, Tournament } from "@shared/schema";

interface Player {
  id: string;
  firstName: string;
  lastName: string;
}

interface TournamentRankingDialogProps {
  tournament: Tournament;
  players: Player[];
  onSuccess?: () => void;
}

interface RankingEntry {
  position: number;
  playerId: string;
  player2Id?: string;
}

export function TournamentRankingDialog({ tournament, players, onSuccess }: TournamentRankingDialogProps) {
  const [open, setOpen] = useState(false);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [positionsCount, setPositionsCount] = useState(8);
  const { toast } = useToast();

  const isCoupleTournament = tournament.registrationType === "couple";

  const { data: scoringProfile } = useQuery<ScoringProfileWithEntries>({
    queryKey: ['/api/scoring-profiles/default'],
  });

  const saveResultsMutation = useMutation({
    mutationFn: async (results: any[]) => {
      return apiRequest('POST', `/api/tournaments/${tournament.id}/results`, results);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments', tournament.id] });
      toast({
        title: "Classifica salvata",
        description: "I punti sono stati assegnati ai giocatori",
      });
      setOpen(false);
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile salvare la classifica",
        variant: "destructive",
      });
    },
  });

  const getPointsForPosition = (position: number): number => {
    if (!scoringProfile) return 0;
    const entry = scoringProfile.entries.find(e => e.position === position);
    if (entry) return entry.points;
    if (position > 16) return scoringProfile.participationPoints;
    return 0;
  };

  const calculateFinalPoints = (basePoints: number): number => {
    return Math.round(basePoints * tournament.pointsMultiplier);
  };

  const positionEntries = useMemo(() => {
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
  }, [positionsCount, rankings, scoringProfile, tournament.pointsMultiplier]);

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

  const getPlayerName = (playerId: string): string => {
    const player = players.find(p => p.id === playerId);
    return player ? `${player.firstName} ${player.lastName}` : "";
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

  const handleSave = () => {
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
        player2Id: isCoupleTournament ? r.player2Id : undefined,
        basePoints,
        multiplier: tournament.pointsMultiplier,
        finalPoints,
      };
    });

    saveResultsMutation.mutate(results);
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

  const resetForm = () => {
    setRankings([]);
    setPositionsCount(8);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2" data-testid="button-assign-ranking">
          <Trophy className="h-4 w-4" />
          Assegna Classifica
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Classifica Finale - {tournament.name}
          </DialogTitle>
          <DialogDescription>
            Assegna le posizioni finali ai {isCoupleTournament ? "coppie" : "giocatori"}. I punti vengono calcolati automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4" />
              Moltiplicatore: <Badge variant="secondary">{tournament.pointsMultiplier}x</Badge>
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
              {positionEntries.map((entry) => (
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
                          <SelectTrigger className="flex-1" data-testid={`select-position-${entry.position}-player`}>
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

                    <div className="flex flex-col items-end min-w-[5rem]">
                      <span className="text-sm font-medium">{entry.finalPoints} pt</span>
                      {tournament.pointsMultiplier !== 1 && (
                        <span className="text-xs text-muted-foreground">
                          ({entry.basePoints} × {tournament.pointsMultiplier})
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-testid="button-cancel-ranking"
            >
              Annulla
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveResultsMutation.isPending}
              className="gap-2"
              data-testid="button-save-ranking"
            >
              <Save className="h-4 w-4" />
              {saveResultsMutation.isPending ? "Salvataggio..." : "Salva Classifica"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
