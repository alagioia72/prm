import { useState, useEffect } from "react";
import { Calendar, Pencil } from "lucide-react";
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

interface Tournament {
  id: number;
  name: string;
  clubId: number;
  startDate: Date | string;
  gender: string;
  level: string;
  maxParticipants: number;
  pointsMultiplier: number;
  registrationType: string;
  format: string;
  status: string;
}

interface Club {
  id: number;
  name: string;
}

interface EditTournamentDialogProps {
  tournament: Tournament | null;
  clubs: Club[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: number, data: {
    name: string;
    clubId: number;
    startDate: Date;
    gender: string;
    level: string;
    maxParticipants: number;
    pointsMultiplier: number;
    registrationType: string;
    format: string;
    status: string;
  }) => void;
}

export function EditTournamentDialog({ tournament, clubs, open, onOpenChange, onSubmit }: EditTournamentDialogProps) {
  const [name, setName] = useState("");
  const [clubId, setClubId] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [gender, setGender] = useState<string>("mixed");
  const [level, setLevel] = useState<string>("intermediate");
  const [maxParticipants, setMaxParticipants] = useState<number>(16);
  const [pointsMultiplier, setPointsMultiplier] = useState<number>(1);
  const [registrationType, setRegistrationType] = useState<string>("couple");
  const [format, setFormat] = useState<string>("bracket");
  const [status, setStatus] = useState<string>("upcoming");

  useEffect(() => {
    if (tournament) {
      setName(tournament.name);
      setClubId(tournament.clubId.toString());
      const date = new Date(tournament.startDate);
      setStartDate(date.toISOString().split('T')[0]);
      setGender(tournament.gender);
      setLevel(tournament.level);
      setMaxParticipants(tournament.maxParticipants);
      setPointsMultiplier(tournament.pointsMultiplier);
      setRegistrationType(tournament.registrationType);
      setFormat(tournament.format);
      setStatus(tournament.status);
    }
  }, [tournament]);

  const handleSubmit = () => {
    if (!tournament || !name || !clubId || !startDate) {
      return;
    }

    onSubmit(tournament.id, {
      name,
      clubId: parseInt(clubId),
      startDate: new Date(startDate),
      gender,
      level,
      maxParticipants,
      pointsMultiplier,
      registrationType,
      format,
      status,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Modifica Torneo
          </DialogTitle>
          <DialogDescription>
            Modifica i dettagli del torneo
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="editTournamentName">Nome Torneo *</Label>
            <Input
              id="editTournamentName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome del torneo"
              data-testid="input-edit-tournament-name"
            />
          </div>

          <div className="space-y-2">
            <Label>Sede *</Label>
            <Select value={clubId} onValueChange={setClubId}>
              <SelectTrigger data-testid="select-edit-tournament-club">
                <SelectValue placeholder="Seleziona sede" />
              </SelectTrigger>
              <SelectContent>
                {clubs.map((club) => (
                  <SelectItem key={club.id} value={club.id.toString()}>
                    {club.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="editTournamentDate">Data Inizio *</Label>
            <Input
              id="editTournamentDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              data-testid="input-edit-tournament-date"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Genere</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger data-testid="select-edit-tournament-gender">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Maschile</SelectItem>
                  <SelectItem value="female">Femminile</SelectItem>
                  <SelectItem value="mixed">Misto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Livello</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger data-testid="select-edit-tournament-level">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo Iscrizione</Label>
              <Select value={registrationType} onValueChange={setRegistrationType}>
                <SelectTrigger data-testid="select-edit-tournament-registration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="couple">Coppia</SelectItem>
                  <SelectItem value="individual">Individuale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Formato</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger data-testid="select-edit-tournament-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bracket">Tabellone</SelectItem>
                  <SelectItem value="round_robin">Round Robin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editMaxParticipants">Max Partecipanti</Label>
              <Input
                id="editMaxParticipants"
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 16)}
                min={2}
                max={128}
                data-testid="input-edit-tournament-max-participants"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editMultiplier">Moltiplicatore Punti</Label>
              <Input
                id="editMultiplier"
                type="number"
                value={pointsMultiplier}
                onChange={(e) => setPointsMultiplier(parseFloat(e.target.value) || 1)}
                min={0.1}
                max={10}
                step={0.1}
                data-testid="input-edit-tournament-multiplier"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Stato</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger data-testid="select-edit-tournament-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">In Programma</SelectItem>
                <SelectItem value="in_progress">In Corso</SelectItem>
                <SelectItem value="completed">Completato</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-edit-tournament">
            Annulla
          </Button>
          <Button onClick={handleSubmit} data-testid="button-save-tournament">
            Salva Modifiche
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
