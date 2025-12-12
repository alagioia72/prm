import { useState, useEffect } from "react";
import { Building2, Pencil } from "lucide-react";
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

interface Club {
  id: number;
  name: string;
  address: string;
  city: string;
  courtsCount?: number;
}

interface EditClubDialogProps {
  club: Club | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: number, data: { name: string; address: string; city: string; courtsCount?: number }) => void;
}

export function EditClubDialog({ club, open, onOpenChange, onSubmit }: EditClubDialogProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [courtsCount, setCourtsCount] = useState(1);

  useEffect(() => {
    if (club) {
      setName(club.name);
      setAddress(club.address);
      setCity(club.city);
      setCourtsCount(club.courtsCount ?? 1);
    }
  }, [club]);

  const handleSubmit = () => {
    if (!club || !name || !address || !city) {
      return;
    }

    onSubmit(club.id, {
      name,
      address,
      city,
      courtsCount,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Modifica Sede
          </DialogTitle>
          <DialogDescription>
            Modifica i dettagli della sede
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="editClubName">Nome Sede *</Label>
            <Input
              id="editClubName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="es. Padel Club Milano Centro"
              data-testid="input-edit-club-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editAddress">Indirizzo *</Label>
            <Input
              id="editAddress"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="es. Via Roma 123"
              data-testid="input-edit-club-address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editCity">Città *</Label>
              <Input
                id="editCity"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="es. Milano"
                data-testid="input-edit-club-city"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editCourtsCount">Numero Campi</Label>
              <Input
                id="editCourtsCount"
                type="number"
                min={1}
                value={courtsCount}
                onChange={(e) => setCourtsCount(parseInt(e.target.value) || 1)}
                data-testid="input-edit-club-courts"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-edit-club">
            Annulla
          </Button>
          <Button onClick={handleSubmit} data-testid="button-save-club">
            Salva Modifiche
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
