import { Calendar, Users, MapPin, User, Users2, Star, Trophy } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { it } from "date-fns/locale";

export type RegistrationType = 'couple' | 'individual';
export type TournamentFormat = 'bracket' | 'round_robin';

export interface Tournament {
  id: number;
  name: string;
  date: Date;
  location: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  gender: 'male' | 'female' | 'mixed';
  maxParticipants: number;
  currentParticipants: number;
  status: 'open' | 'in_progress' | 'completed';
  pointsMultiplier: number;
  registrationType: RegistrationType;
  format: TournamentFormat;
}

interface TournamentCardProps {
  tournament: Tournament;
  onRegister?: (id: number) => void;
  onViewDetails?: (id: number) => void;
  onAssignRanking?: (tournament: Tournament) => void;
  isRegistered?: boolean;
  isAdmin?: boolean;
  isAuthenticated?: boolean;
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

export function TournamentCard({ tournament, onRegister, onViewDetails, onAssignRanking, isRegistered, isAdmin, isAuthenticated }: TournamentCardProps) {
  const spotsLeft = tournament.maxParticipants - tournament.currentParticipants;
  const participantLabel = tournament.registrationType === 'couple' ? 'coppie' : 'giocatori';
  
  return (
    <Card className="flex flex-col hover-elevate" data-testid={`card-tournament-${tournament.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-bold line-clamp-2" data-testid={`text-tournament-name-${tournament.id}`}>
            {tournament.name}
          </CardTitle>
          <Badge 
            variant={tournament.status === 'open' ? 'default' : tournament.status === 'in_progress' ? 'secondary' : 'outline'}
            data-testid={`badge-status-${tournament.id}`}
          >
            {statusLabels[tournament.status]}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline">{levelLabels[tournament.level]}</Badge>
          <Badge variant="outline">{genderLabels[tournament.gender]}</Badge>
          <Badge 
            variant="secondary" 
            className="gap-1"
            data-testid={`badge-multiplier-${tournament.id}`}
          >
            <Star className="h-3 w-3" />
            x{tournament.pointsMultiplier % 1 === 0 ? tournament.pointsMultiplier : tournament.pointsMultiplier.toFixed(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant="outline" 
            className="gap-1"
            data-testid={`badge-registration-type-${tournament.id}`}
          >
            {tournament.registrationType === 'couple' ? (
              <Users2 className="h-3 w-3" />
            ) : (
              <User className="h-3 w-3" />
            )}
            {registrationTypeLabels[tournament.registrationType]}
          </Badge>
          <Badge 
            variant="outline"
            data-testid={`badge-format-${tournament.id}`}
          >
            {formatLabels[tournament.format]}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 shrink-0" />
          <span data-testid={`text-tournament-date-${tournament.id}`}>
            {format(tournament.date, "EEEE d MMMM yyyy", { locale: it })}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          <span>{tournament.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4 shrink-0" />
          <span>
            {tournament.currentParticipants}/{tournament.maxParticipants} {participantLabel}
            {spotsLeft > 0 && spotsLeft <= 4 && (
              <span className="text-destructive font-medium"> ({spotsLeft} posti rimasti)</span>
            )}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 gap-2 flex-wrap">
        {isAuthenticated && tournament.status === 'open' && !isRegistered && spotsLeft > 0 && (
          <Button 
            className="flex-1" 
            onClick={() => onRegister?.(tournament.id)}
            data-testid={`button-register-${tournament.id}`}
          >
            Iscriviti
          </Button>
        )}
        {isRegistered && tournament.status === 'open' && (
          <Badge variant="secondary" className="flex-1 justify-center py-2">Iscritto</Badge>
        )}
        {isAdmin && (tournament.status === 'in_progress' || tournament.status === 'completed') && (
          <Button 
            variant="default"
            className="flex-1 gap-1"
            onClick={() => onAssignRanking?.(tournament)}
            data-testid={`button-assign-ranking-${tournament.id}`}
          >
            <Trophy className="h-4 w-4" />
            {tournament.status === 'completed' ? 'Modifica Classifica' : 'Assegna Classifica'}
          </Button>
        )}
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => onViewDetails?.(tournament.id)}
          data-testid={`button-details-${tournament.id}`}
        >
          Dettagli
        </Button>
      </CardFooter>
    </Card>
  );
}
