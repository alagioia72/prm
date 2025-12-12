import { useState, useEffect } from "react";
import { User, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  level: string;
  clubId: number | null;
}

interface Club {
  id: number;
  name: string;
}

interface EditPlayerDialogProps {
  player: Player | null;
  clubs: Club[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, data: { firstName: string; lastName: string; gender: string; level: string; clubId: number | null }) => void;
}

export function EditPlayerDialog({ player, clubs, open, onOpenChange, onSubmit }: EditPlayerDialogProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<string>("male");
  const [level, setLevel] = useState<string>("beginner");
  const [clubId, setClubId] = useState<string>("");

  useEffect(() => {
    if (player) {
      setFirstName(player.firstName);
      setLastName(player.lastName);
      setGender(player.gender);
      setLevel(player.level);
      setClubId(player.clubId ? player.clubId.toString() : "none");
    }
  }, [player]);

  const handleSubmit = () => {
    if (!player || !firstName || !lastName) {
      return;
    }

    onSubmit(player.id, {
      firstName,
      lastName,
      gender,
      level,
      clubId: clubId && clubId !== "none" ? parseInt(clubId) : null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Modifica Giocatore
          </DialogTitle>
          <DialogDescription>
            Modifica i dettagli del giocatore
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editFirstName">Nome *</Label>
              <Input
                id="editFirstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Nome"
                data-testid="input-edit-player-firstname"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editLastName">Cognome *</Label>
              <Input
                id="editLastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Cognome"
                data-testid="input-edit-player-lastname"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Genere</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger data-testid="select-edit-player-gender">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Maschile</SelectItem>
                  <SelectItem value="female">Femminile</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Livello</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger data-testid="select-edit-player-level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Principiante</SelectItem>
                  <SelectItem value="intermediate">Intermedio</SelectItem>
                  <SelectItem value="advanced">Avanzato</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sede</Label>
            <Select value={clubId} onValueChange={setClubId}>
              <SelectTrigger data-testid="select-edit-player-club">
                <SelectValue placeholder="Seleziona sede" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nessuna sede</SelectItem>
                {clubs.map((club) => (
                  <SelectItem key={club.id} value={club.id.toString()}>
                    {club.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-edit-player">
            Annulla
          </Button>
          <Button onClick={handleSubmit} data-testid="button-save-player">
            Salva Modifiche
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
