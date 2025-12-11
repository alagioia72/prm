import { useState } from "react";
import { Users, User, UserPlus, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Tournament, Player } from "@shared/schema";

interface TournamentRegistrationDialogProps {
  tournament: Tournament;
  currentPlayerId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TournamentRegistrationDialog({ 
  tournament, 
  currentPlayerId,
  isOpen,
  onOpenChange,
  onSuccess 
}: TournamentRegistrationDialogProps) {
  const [partnerId, setPartnerId] = useState<string>("");
  const [registrationError, setRegistrationError] = useState<string>("");
  const { toast } = useToast();

  const { data: players = [], isLoading: playersLoading } = useQuery<Player[]>({
    queryKey: ['/api/players'],
    enabled: isOpen,
  });

  const isCoupleTournament = tournament.registrationType === "couple";

  const eligiblePartners = players.filter(p => {
    if (p.id === currentPlayerId) return false;
    if (tournament.gender !== "mixed" && p.gender !== tournament.gender) return false;
    if (p.level !== tournament.level) return false;
    return true;
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const data: { playerId: string; partnerId?: string } = {
        playerId: currentPlayerId,
      };
      if (isCoupleTournament && partnerId) {
        data.partnerId = partnerId;
      }
      return apiRequest('POST', `/api/tournaments/${tournament.id}/register`, data);
    },
    onSuccess: () => {
      setRegistrationError("");
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments', tournament.id, 'registrations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/players', currentPlayerId, 'registrations'] });
      toast({
        title: "Iscrizione completata",
        description: isCoupleTournament 
          ? "Tu e il tuo partner siete iscritti al torneo" 
          : "Sei iscritto al torneo",
      });
      onOpenChange(false);
      setPartnerId("");
      onSuccess?.();
    },
    onError: (error: any) => {
      const message = error?.message || "Impossibile completare l'iscrizione";
      setRegistrationError(message);
      toast({
        title: "Errore",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    setRegistrationError("");
    if (isCoupleTournament && !partnerId) {
      toast({
        title: "Seleziona un partner",
        description: "Per i tornei a coppia devi selezionare un compagno di squadra",
        variant: "destructive",
      });
      return;
    }
    registerMutation.mutate();
  };

  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const selectedPartner = players.find(p => p.id === partnerId);

  const formatGender = (gender: string) => {
    switch (gender) {
      case "male": return "Maschile";
      case "female": return "Femminile";
      case "mixed": return "Misto";
      default: return gender;
    }
  };

  const formatLevel = (level: string) => {
    switch (level) {
      case "beginner": return "Principianti";
      case "intermediate": return "Intermedio";
      case "advanced": return "Avanzato";
      default: return level;
    }
  };

  const isCurrentPlayerEligible = currentPlayer && (
    (tournament.gender === "mixed" || currentPlayer.gender === tournament.gender) &&
    currentPlayer.level === tournament.level
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Iscrizione Torneo
          </DialogTitle>
          <DialogDescription>
            {tournament.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="outline">
                {isCoupleTournament ? (
                  <><Users className="h-3 w-3 mr-1" /> Coppia</>
                ) : (
                  <><User className="h-3 w-3 mr-1" /> Individuale</>
                )}
              </Badge>
              <Badge variant="secondary">{formatGender(tournament.gender)}</Badge>
              <Badge variant="secondary">{formatLevel(tournament.level)}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Punti: x{tournament.pointsMultiplier} | Max partecipanti: {tournament.maxParticipants}
            </p>
          </Card>

          {registrationError && (
            <Card className="p-3 border-destructive bg-destructive/10">
              <div className="flex items-start gap-2 text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="text-sm" data-testid="text-registration-error">{registrationError}</p>
              </div>
            </Card>
          )}

          {playersLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Giocatore</label>
                <Card className={`p-3 ${!isCurrentPlayerEligible ? 'border-destructive bg-destructive/5' : 'bg-muted/50'}`}>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {currentPlayer 
                        ? `${currentPlayer.firstName} ${currentPlayer.lastName}` 
                        : "Tu"}
                    </span>
                    <Badge variant="outline" className="ml-auto">Tu</Badge>
                  </div>
                  {currentPlayer && !isCurrentPlayerEligible && (
                    <p className="text-xs text-destructive mt-2">
                      Non sei idoneo: {currentPlayer.gender !== tournament.gender && tournament.gender !== "mixed" ? `categoria ${formatGender(tournament.gender)} richiesta` : ''} 
                      {currentPlayer.level !== tournament.level ? `livello ${formatLevel(tournament.level)} richiesto` : ''}
                    </p>
                  )}
                </Card>
              </div>

              {isCoupleTournament && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Partner di squadra</label>
                  <Select value={partnerId} onValueChange={setPartnerId}>
                    <SelectTrigger data-testid="select-partner">
                      <SelectValue placeholder="Seleziona il tuo partner" />
                    </SelectTrigger>
                    <SelectContent>
                      {eligiblePartners.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          Nessun partner idoneo disponibile
                        </div>
                      ) : (
                        eligiblePartners.map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.firstName} {player.lastName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {eligiblePartners.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      I partner devono avere lo stesso genere ({formatGender(tournament.gender)}) e livello ({formatLevel(tournament.level)})
                    </p>
                  )}
                </div>
              )}

              {selectedPartner && (
                <Card className="p-3 bg-primary/5 border-primary/20">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="font-medium">La tua squadra:</span>
                  </div>
                  <p className="text-sm mt-1 text-muted-foreground">
                    {currentPlayer?.firstName} {currentPlayer?.lastName} &amp; {selectedPartner.firstName} {selectedPartner.lastName}
                  </p>
                </Card>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Annulla
            </Button>
            <Button 
              className="flex-1"
              onClick={handleSubmit}
              disabled={
                registerMutation.isPending || 
                (isCoupleTournament && !partnerId) || 
                !isCurrentPlayerEligible ||
                playersLoading
              }
              data-testid="button-confirm-registration"
            >
              {registerMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Iscrizione...</>
              ) : (
                <><Check className="h-4 w-4 mr-2" /> Conferma Iscrizione</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
