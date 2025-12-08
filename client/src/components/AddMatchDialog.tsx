import { useState, useEffect, useMemo } from "react";
import { Plus, Minus, Users, Star, Trophy, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { Club, MatchPointsCalculation } from "@shared/schema";

interface Player {
  id: string;
  firstName: string;
  lastName: string;
}

interface MatchSubmitData {
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
}

interface AddMatchDialogProps {
  players: Player[];
  onSubmit: (data: MatchSubmitData) => void;
  trigger?: React.ReactNode;
}

export function AddMatchDialog({ players, onSubmit, trigger }: AddMatchDialogProps) {
  const [open, setOpen] = useState(false);
  const [clubId, setClubId] = useState<string>("");
  const [team1Player1, setTeam1Player1] = useState<string>("");
  const [team1Player2, setTeam1Player2] = useState<string>("");
  const [team2Player1, setTeam2Player1] = useState<string>("");
  const [team2Player2, setTeam2Player2] = useState<string>("");
  const [sets, setSets] = useState([{ score1: 0, score2: 0 }, { score1: 0, score2: 0 }]);

  const { data: clubs = [] } = useQuery<Club[]>({
    queryKey: ['/api/clubs'],
  });

  const setsPlayed = sets.length as 2 | 3;

  const { data: pointsCalc } = useQuery<MatchPointsCalculation>({
    queryKey: ['/api/matches/calculate-points', setsPlayed],
  });

  const matchResult = useMemo(() => {
    let team1Wins = 0;
    let team2Wins = 0;
    
    sets.forEach(set => {
      if (set.score1 > set.score2) team1Wins++;
      else if (set.score2 > set.score1) team2Wins++;
    });

    const winnerTeam = team1Wins > team2Wins ? 1 : team2Wins > team1Wins ? 2 : null;
    const isValid = (setsPlayed === 2 && (team1Wins === 2 || team2Wins === 2)) ||
                   (setsPlayed === 3 && (team1Wins === 2 || team2Wins === 2));
    
    return { team1Wins, team2Wins, winnerTeam, isValid };
  }, [sets, setsPlayed]);

  const addSet = () => {
    if (sets.length < 3) {
      setSets([...sets, { score1: 0, score2: 0 }]);
    }
  };

  const removeSet = () => {
    if (sets.length > 2) {
      setSets(sets.slice(0, -1));
    }
  };

  const updateSet = (index: number, field: 'score1' | 'score2', value: number) => {
    const newSets = [...sets];
    newSets[index][field] = Math.max(0, Math.min(7, value));
    setSets(newSets);
  };

  const handleSubmit = () => {
    if (!clubId || !team1Player1 || !team2Player1) {
      return;
    }

    if (!matchResult.winnerTeam || !matchResult.isValid) {
      return;
    }

    const matchData: MatchSubmitData = {
      clubId: parseInt(clubId),
      team1Player1Id: team1Player1,
      team1Player2Id: team1Player2 || undefined,
      team2Player1Id: team2Player1,
      team2Player2Id: team2Player2 || undefined,
      set1Team1: sets[0].score1,
      set1Team2: sets[0].score2,
      set2Team1: sets[1].score1,
      set2Team2: sets[1].score2,
      set3Team1: sets[2]?.score1,
      set3Team2: sets[2]?.score2,
      setsPlayed,
      winnerTeam: matchResult.winnerTeam,
      pointsAwarded: pointsCalc?.pointsAwarded ?? 20,
    };

    onSubmit(matchData);
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setClubId("");
    setTeam1Player1("");
    setTeam1Player2("");
    setTeam2Player1("");
    setTeam2Player2("");
    setSets([{ score1: 0, score2: 0 }, { score1: 0, score2: 0 }]);
  };

  const selectedPlayers = [team1Player1, team1Player2, team2Player1, team2Player2].filter(Boolean);

  const getAvailablePlayers = (currentValue: string) => {
    return players.filter(p => 
      !selectedPlayers.includes(p.id) || p.id === currentValue
    );
  };

  const canSubmit = clubId && team1Player1 && team2Player1 && matchResult.isValid;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2" data-testid="button-add-match">
            <Plus className="h-4 w-4" />
            Aggiungi Partita
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registra una Partita</DialogTitle>
          <DialogDescription>
            Inserisci i dettagli della partita giocata fuori dai tornei
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="club">Sede</Label>
            </div>
            <Select value={clubId} onValueChange={setClubId}>
              <SelectTrigger id="club" data-testid="select-match-club">
                <SelectValue placeholder="Seleziona sede" />
              </SelectTrigger>
              <SelectContent>
                {clubs.map(club => (
                  <SelectItem key={club.id} value={String(club.id)}>
                    {club.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4" />
              Squadra 1
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="team1-player1">Giocatore 1 *</Label>
                <Select value={team1Player1} onValueChange={setTeam1Player1}>
                  <SelectTrigger id="team1-player1" data-testid="select-team1-player1">
                    <SelectValue placeholder="Seleziona" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailablePlayers(team1Player1).map(player => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.firstName} {player.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="team1-player2">Giocatore 2</Label>
                <Select value={team1Player2} onValueChange={setTeam1Player2}>
                  <SelectTrigger id="team1-player2" data-testid="select-team1-player2">
                    <SelectValue placeholder="Opzionale" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailablePlayers(team1Player2).map(player => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.firstName} {player.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4" />
              Squadra 2
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="team2-player1">Giocatore 1 *</Label>
                <Select value={team2Player1} onValueChange={setTeam2Player1}>
                  <SelectTrigger id="team2-player1" data-testid="select-team2-player1">
                    <SelectValue placeholder="Seleziona" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailablePlayers(team2Player1).map(player => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.firstName} {player.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="team2-player2">Giocatore 2</Label>
                <Select value={team2Player2} onValueChange={setTeam2Player2}>
                  <SelectTrigger id="team2-player2" data-testid="select-team2-player2">
                    <SelectValue placeholder="Opzionale" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailablePlayers(team2Player2).map(player => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.firstName} {player.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Punteggio Set</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{setsPlayed} set</span>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={removeSet}
                  disabled={sets.length <= 2}
                  data-testid="button-remove-set"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={addSet}
                  disabled={sets.length >= 3}
                  data-testid="button-add-set"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {sets.map((set, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-12">Set {index + 1}</span>
                <Input
                  type="number"
                  min={0}
                  max={7}
                  value={set.score1}
                  onChange={(e) => updateSet(index, 'score1', parseInt(e.target.value) || 0)}
                  className="w-16 text-center"
                  data-testid={`input-set${index + 1}-score1`}
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  min={0}
                  max={7}
                  value={set.score2}
                  onChange={(e) => updateSet(index, 'score2', parseInt(e.target.value) || 0)}
                  className="w-16 text-center"
                  data-testid={`input-set${index + 1}-score2`}
                />
              </div>
            ))}
          </div>

          <Card className="bg-muted/30">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <span>Risultato</span>
                </div>
                {matchResult.winnerTeam ? (
                  <Badge variant="default" data-testid="badge-winner">
                    Squadra {matchResult.winnerTeam} vince {matchResult.team1Wins > matchResult.team2Wins ? matchResult.team1Wins : matchResult.team2Wins}-{matchResult.team1Wins > matchResult.team2Wins ? matchResult.team2Wins : matchResult.team1Wins}
                  </Badge>
                ) : (
                  <Badge variant="outline" data-testid="badge-no-winner">
                    Completa i set
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span>Punti vincitori</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-lg" data-testid="text-points-awarded">
                    {pointsCalc?.pointsAwarded ?? '-'} pt
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {pointsCalc?.basePoints ?? 100}pt / {pointsCalc?.divisor ?? (setsPlayed === 2 ? 5 : 6)} = {pointsCalc?.pointsAwarded ?? '-'}pt
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel-match">
            Annulla
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!canSubmit}
            data-testid="button-submit-match"
          >
            Registra Partita
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
