import { useState } from "react";
import { Plus, Calendar, MapPin } from "lucide-react";
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

interface CreateTournamentDialogProps {
  onSubmit: (data: {
    name: string;
    date: string;
    location: string;
    level: string;
    gender: string;
    maxParticipants: number;
    pointsMultiplier: number;
  }) => void;
  trigger?: React.ReactNode;
}

export function CreateTournamentDialog({ onSubmit, trigger }: CreateTournamentDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [level, setLevel] = useState("");
  const [gender, setGender] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(16);
  const [pointsMultiplier, setPointsMultiplier] = useState(2);

  const handleSubmit = () => {
    if (!name || !date || !location || !level || !gender) {
      console.log("Compila tutti i campi obbligatori");
      return;
    }

    onSubmit({
      name,
      date,
      location,
      level,
      gender,
      maxParticipants,
      pointsMultiplier,
    });
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setDate("");
    setLocation("");
    setLevel("");
    setGender("");
    setMaxParticipants(16);
    setPointsMultiplier(2);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2" data-testid="button-create-tournament">
            <Plus className="h-4 w-4" />
            Crea Torneo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Crea Nuovo Torneo</DialogTitle>
          <DialogDescription>
            Inserisci i dettagli del torneo che vuoi organizzare
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Torneo *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="es. Torneo Primavera 2024"
              data-testid="input-tournament-name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <div className="relative">
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  data-testid="input-tournament-date"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Luogo *</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="es. Padel Club Milano"
                data-testid="input-tournament-location"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level">Livello *</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger id="level" data-testid="select-tournament-level">
                  <SelectValue placeholder="Seleziona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Principiante</SelectItem>
                  <SelectItem value="intermediate">Intermedio</SelectItem>
                  <SelectItem value="advanced">Avanzato</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Categoria *</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger id="gender" data-testid="select-tournament-gender">
                  <SelectValue placeholder="Seleziona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Maschile</SelectItem>
                  <SelectItem value="female">Femminile</SelectItem>
                  <SelectItem value="mixed">Misto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Max Partecipanti</Label>
              <Select value={String(maxParticipants)} onValueChange={(v) => setMaxParticipants(Number(v))}>
                <SelectTrigger id="maxParticipants" data-testid="select-tournament-max">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="16">16</SelectItem>
                  <SelectItem value="32">32</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pointsMultiplier">Moltiplicatore Punti</Label>
              <Select value={String(pointsMultiplier)} onValueChange={(v) => setPointsMultiplier(Number(v))}>
                <SelectTrigger id="pointsMultiplier" data-testid="select-tournament-multiplier">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">x1</SelectItem>
                  <SelectItem value="2">x2</SelectItem>
                  <SelectItem value="3">x3</SelectItem>
                  <SelectItem value="5">x5</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel-tournament">
            Annulla
          </Button>
          <Button onClick={handleSubmit} data-testid="button-submit-tournament">
            Crea Torneo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
