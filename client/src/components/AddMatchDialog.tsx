import { useState } from "react";
import { Plus, Minus, Users } from "lucide-react";
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

interface Player {
  id: number;
  firstName: string;
  lastName: string;
}

interface AddMatchDialogProps {
  players: Player[];
  onSubmit: (data: {
    team1: number[];
    team2: number[];
    sets: { score1: number; score2: number }[];
  }) => void;
  trigger?: React.ReactNode;
}

export function AddMatchDialog({ players, onSubmit, trigger }: AddMatchDialogProps) {
  const [open, setOpen] = useState(false);
  const [team1Player1, setTeam1Player1] = useState<string>("");
  const [team1Player2, setTeam1Player2] = useState<string>("");
  const [team2Player1, setTeam2Player1] = useState<string>("");
  const [team2Player2, setTeam2Player2] = useState<string>("");
  const [sets, setSets] = useState([{ score1: 0, score2: 0 }]);

  const addSet = () => {
    if (sets.length < 3) {
      setSets([...sets, { score1: 0, score2: 0 }]);
    }
  };

  const removeSet = () => {
    if (sets.length > 1) {
      setSets(sets.slice(0, -1));
    }
  };

  const updateSet = (index: number, field: 'score1' | 'score2', value: number) => {
    const newSets = [...sets];
    newSets[index][field] = Math.max(0, Math.min(7, value));
    setSets(newSets);
  };

  const handleSubmit = () => {
    const team1 = [team1Player1, team1Player2].filter(Boolean).map(Number);
    const team2 = [team2Player1, team2Player2].filter(Boolean).map(Number);
    
    if (team1.length < 1 || team2.length < 1) {
      console.log("Seleziona almeno un giocatore per squadra");
      return;
    }

    onSubmit({ team1, team2, sets });
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTeam1Player1("");
    setTeam1Player2("");
    setTeam2Player1("");
    setTeam2Player2("");
    setSets([{ score1: 0, score2: 0 }]);
  };

  const selectedPlayers = [team1Player1, team1Player2, team2Player1, team2Player2].filter(Boolean);

  const getAvailablePlayers = (currentValue: string) => {
    return players.filter(p => 
      !selectedPlayers.includes(String(p.id)) || String(p.id) === currentValue
    );
  };

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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Registra una Partita</DialogTitle>
          <DialogDescription>
            Inserisci i dettagli della partita giocata fuori dai tornei
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4" />
              Squadra 1
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="team1-player1">Giocatore 1</Label>
                <Select value={team1Player1} onValueChange={setTeam1Player1}>
                  <SelectTrigger id="team1-player1" data-testid="select-team1-player1">
                    <SelectValue placeholder="Seleziona" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailablePlayers(team1Player1).map(player => (
                      <SelectItem key={player.id} value={String(player.id)}>
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
                    <SelectValue placeholder="Seleziona" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailablePlayers(team1Player2).map(player => (
                      <SelectItem key={player.id} value={String(player.id)}>
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
                <Label htmlFor="team2-player1">Giocatore 1</Label>
                <Select value={team2Player1} onValueChange={setTeam2Player1}>
                  <SelectTrigger id="team2-player1" data-testid="select-team2-player1">
                    <SelectValue placeholder="Seleziona" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailablePlayers(team2Player1).map(player => (
                      <SelectItem key={player.id} value={String(player.id)}>
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
                    <SelectValue placeholder="Seleziona" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailablePlayers(team2Player2).map(player => (
                      <SelectItem key={player.id} value={String(player.id)}>
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
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={removeSet}
                  disabled={sets.length <= 1}
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel-match">
            Annulla
          </Button>
          <Button onClick={handleSubmit} data-testid="button-submit-match">
            Registra Partita
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
