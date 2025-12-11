import { useState } from "react";
import { Plus, Building2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";

interface CreateClubDialogProps {
  onSubmit: (data: {
    name: string;
    address: string;
    city: string;
    province: string;
    isMain: boolean;
  }) => void;
  trigger?: React.ReactNode;
}

export function CreateClubDialog({ onSubmit, trigger }: CreateClubDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [isMain, setIsMain] = useState(false);

  const handleSubmit = () => {
    if (!name || !address || !city || !province) {
      console.log("Compila tutti i campi obbligatori");
      return;
    }

    onSubmit({
      name,
      address,
      city,
      province,
      isMain,
    });
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setAddress("");
    setCity("");
    setProvince("");
    setIsMain(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2" data-testid="button-create-club">
            <Plus className="h-4 w-4" />
            Aggiungi Sede
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Nuova Sede
          </DialogTitle>
          <DialogDescription>
            Aggiungi una nuova sede alla catena di club
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="clubName">Nome Sede *</Label>
            <Input
              id="clubName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="es. Padel Club Milano Centro"
              data-testid="input-club-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Indirizzo *</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="es. Via Roma 123"
              data-testid="input-club-address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Città *</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="es. Milano"
                data-testid="input-club-city"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">Provincia *</Label>
              <Input
                id="province"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder="es. MI"
                maxLength={2}
                className="uppercase"
                data-testid="input-club-province"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isMain" 
              checked={isMain}
              onCheckedChange={(checked) => setIsMain(checked === true)}
              data-testid="checkbox-is-main"
            />
            <Label htmlFor="isMain" className="text-sm font-normal cursor-pointer">
              Imposta come sede principale
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel-club">
            Annulla
          </Button>
          <Button onClick={handleSubmit} data-testid="button-submit-club">
            Crea Sede
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
