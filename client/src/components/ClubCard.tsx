import { MapPin, Users, Trophy, Settings, Trash2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface Club {
  id: number;
  name: string;
  address: string;
  city: string;
  province: string;
  playersCount: number;
  tournamentsCount: number;
  isMain?: boolean;
}

interface ClubCardProps {
  club: Club;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onViewDetails?: (id: number) => void;
  isAdmin?: boolean;
}

export function ClubCard({ club, onEdit, onDelete, onViewDetails, isAdmin = false }: ClubCardProps) {
  return (
    <Card className="flex flex-col hover-elevate" data-testid={`card-club-${club.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-bold line-clamp-2" data-testid={`text-club-name-${club.id}`}>
            {club.name}
          </CardTitle>
          {club.isMain && (
            <Badge variant="default" data-testid={`badge-main-${club.id}`}>
              Sede Principale
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          <span>{club.address}, {club.city} ({club.province})</span>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4 shrink-0" />
            <span>{club.playersCount} giocatori</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Trophy className="h-4 w-4 shrink-0" />
            <span>{club.tournamentsCount} tornei</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 gap-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => onViewDetails?.(club.id)}
          data-testid={`button-view-club-${club.id}`}
        >
          Dettagli
        </Button>
        {isAdmin && (
          <>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onEdit?.(club.id)}
              data-testid={`button-edit-club-${club.id}`}
            >
              <Settings className="h-4 w-4" />
            </Button>
            {!club.isMain && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onDelete?.(club.id)}
                data-testid={`button-delete-club-${club.id}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}
