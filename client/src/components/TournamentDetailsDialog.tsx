import { Calendar, MapPin, Users, Trophy, Medal, Star, Users2, User, Edit, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import type { Tournament } from "./TournamentCard";
import type { TournamentRegistrationWithPlayers, Player } from "@shared/schema";

interface TournamentResult {
  id: number;
  tournamentId: number;
  position: number;
  playerId: string;
  player2Id: string | null;
  basePoints: number;
  multiplier: number;
  finalPoints: number;
  createdAt: string;
}

interface TournamentDetailsDialogProps {
  tournament: Tournament | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin?: boolean;
  onEditRanking?: (tournament: Tournament) => void;
}

const levelLabels = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzato',
};

const genderLabels = {
  male: 'Maschile',
  female: 'Femminile',
  mixed: 'Misto',
};

const statusLabels = {
  upcoming: 'Iscrizioni Aperte',
  open: 'Iscrizioni Aperte',
  in_progress: 'In Corso',
  completed: 'Concluso',
};

const registrationTypeLabels = {
  couple: 'Coppie',
  individual: 'Individuale',
};

const formatLabels = {
  bracket: 'Tabellone',
  round_robin: 'Tutti vs Tutti',
};

function getPlayerDisplayName(player?: Player): string {
  if (!player) return 'Giocatore sconosciuto';
  return `${player.firstName} ${player.lastName}`;
}

export function TournamentDetailsDialog({
  tournament,
  open,
  onOpenChange,
  isAdmin,
  onEditRanking,
}: TournamentDetailsDialogProps) {
  const { data: results, isLoading: resultsLoading } = useQuery<TournamentResult[]>({
    queryKey: ['/api/tournaments', tournament?.id, 'results'],
    enabled: !!tournament && (tournament.status === 'in_progress' || tournament.status === 'completed'),
  });

  const { data: registrations, isLoading: registrationsLoading } = useQuery<TournamentRegistrationWithPlayers[]>({
    queryKey: [`/api/tournaments/${tournament?.id}/registrations?withPlayers=true`],
    enabled: !!tournament,
  });

  const { data: allPlayers } = useQuery<Player[]>({
    queryKey: ['/api/players'],
    enabled: !!tournament && (tournament.status === 'in_progress' || tournament.status === 'completed'),
  });

  if (!tournament) return null;

  const isCoupleTournament = tournament.registrationType === 'couple';
  const hasResults = results && results.length > 0;
  const sortedResults = hasResults ? [...results].sort((a, b) => a.position - b.position) : [];

  const getPlayerName = (playerId: string | null): string => {
    if (!playerId) return '-';
    const player = allPlayers?.find(p => p.id === playerId);
    return player ? `${player.firstName} ${player.lastName}` : playerId;
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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'open':
      case 'upcoming':
        return 'default';
      case 'in_progress':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const registrationCount = registrations?.length ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between gap-2">
            <DialogTitle className="text-xl" data-testid="text-tournament-details-title">
              {tournament.name}
            </DialogTitle>
            <Badge variant={getStatusVariant(tournament.status) as any}>
              {statusLabels[tournament.status as keyof typeof statusLabels] || tournament.status}
            </Badge>
          </div>
          <DialogDescription>
            Dettagli del torneo, iscritti e classifica finale
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-2">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span data-testid="text-details-date">
                    {format(tournament.date, "EEEE d MMMM yyyy", { locale: it })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{tournament.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {registrationCount}/{tournament.maxParticipants} {isCoupleTournament ? 'coppie' : 'giocatori'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{levelLabels[tournament.level]}</Badge>
                  <Badge variant="outline">{genderLabels[tournament.gender]}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="gap-1">
                    {isCoupleTournament ? <Users2 className="h-3 w-3" /> : <User className="h-3 w-3" />}
                    {registrationTypeLabels[tournament.registrationType]}
                  </Badge>
                  <Badge variant="outline">{formatLabels[tournament.format]}</Badge>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Star className="h-3 w-3" />
                  Moltiplicatore x{tournament.pointsMultiplier}
                </Badge>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <ClipboardList className="h-5 w-5 text-primary" />
                Iscritti ({registrationCount})
              </h3>

              {registrationsLoading ? (
                <div className="text-center py-4 text-muted-foreground">
                  Caricamento iscritti...
                </div>
              ) : registrations && registrations.length > 0 ? (
                <div className="space-y-2">
                  {isCoupleTournament ? (
                    registrations.map((reg, index) => (
                      <Card key={reg.id} className="p-3" data-testid={`card-registration-${reg.id}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-muted-foreground min-w-[1.5rem]">
                            {index + 1}.
                          </span>
                          <Users2 className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <span className="font-medium">
                              {getPlayerDisplayName(reg.player)}
                            </span>
                            <span className="text-muted-foreground mx-2">&amp;</span>
                            <span className="font-medium">
                              {reg.partner ? getPlayerDisplayName(reg.partner) : 'Partner non assegnato'}
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    registrations.map((reg, index) => (
                      <Card key={reg.id} className="p-3" data-testid={`card-registration-${reg.id}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-muted-foreground min-w-[1.5rem]">
                            {index + 1}.
                          </span>
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {getPlayerDisplayName(reg.player)}
                          </span>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground" data-testid="text-no-registrations">
                  Nessun iscritto ancora
                </div>
              )}
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Classifica Finale
                </h3>
                {isAdmin && (tournament.status === 'in_progress' || tournament.status === 'completed') && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => {
                      onOpenChange(false);
                      onEditRanking?.(tournament);
                    }}
                    data-testid="button-edit-ranking-from-details"
                  >
                    <Edit className="h-4 w-4" />
                    {hasResults ? 'Modifica' : 'Assegna'}
                  </Button>
                )}
              </div>

              {(tournament.status as string) === 'open' || (tournament.status as string) === 'upcoming' ? (
                <div className="text-center py-8 text-muted-foreground">
                  La classifica sarà disponibile al termine del torneo
                </div>
              ) : resultsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Caricamento classifica...
                </div>
              ) : hasResults ? (
                <div className="space-y-2">
                  {sortedResults.map((result) => (
                    <Card key={result.id} className="p-3" data-testid={`card-result-position-${result.position}`}>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 min-w-[2.5rem]">
                          {getPositionIcon(result.position)}
                        </div>
                        
                        <div className="flex-1">
                          {isCoupleTournament ? (
                            <div className="flex items-center gap-2">
                              <span className="font-medium" data-testid={`text-result-player1-${result.position}`}>
                                {getPlayerName(result.playerId)}
                              </span>
                              <Users2 className="h-3 w-3 text-muted-foreground" />
                              <span className="font-medium" data-testid={`text-result-player2-${result.position}`}>
                                {result.player2Id ? getPlayerName(result.player2Id) : '-'}
                              </span>
                            </div>
                          ) : (
                            <span className="font-medium" data-testid={`text-result-player-${result.position}`}>
                              {getPlayerName(result.playerId)}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col items-end">
                          <span className="font-semibold text-primary" data-testid={`text-result-points-${result.position}`}>
                            {result.finalPoints} pt
                          </span>
                          {result.multiplier !== 1 && (
                            <span className="text-xs text-muted-foreground">
                              ({result.basePoints} x {result.multiplier})
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground" data-testid="text-no-results">
                  {tournament.status === 'in_progress' 
                    ? 'Classifica non ancora assegnata. Il torneo è in corso.'
                    : 'Classifica non disponibile'}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
