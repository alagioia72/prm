import { Trophy, Target, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PlayerCardProps {
  player: {
    id: number;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
    gender: 'male' | 'female';
    level: 'beginner' | 'intermediate' | 'advanced';
    points: number;
    ranking: number;
    matchesPlayed: number;
    wins: number;
  };
  onViewProfile?: (id: number) => void;
}

const levelLabels = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzato',
};

const genderLabels = {
  male: 'M',
  female: 'F',
};

export function PlayerCard({ player, onViewProfile }: PlayerCardProps) {
  const winRate = player.matchesPlayed > 0 
    ? Math.round((player.wins / player.matchesPlayed) * 100) 
    : 0;

  return (
    <Card className="hover-elevate" data-testid={`card-player-${player.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={player.profileImageUrl || undefined} className="object-cover" />
            <AvatarFallback className="text-lg">
              {player.firstName[0]}{player.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate" data-testid={`text-player-name-${player.id}`}>
              {player.firstName} {player.lastName}
            </CardTitle>
            <div className="flex flex-wrap gap-2 mt-1">
              <Badge variant="outline">{genderLabels[player.gender]}</Badge>
              <Badge variant="outline">{levelLabels[player.level]}</Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm">
              <Trophy className="h-4 w-4" />
              <span>Rank</span>
            </div>
            <p className="text-2xl font-bold">#{player.ranking}</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm">
              <Target className="h-4 w-4" />
              <span>Punti</span>
            </div>
            <p className="text-2xl font-bold">{player.points}</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm">
              <TrendingUp className="h-4 w-4" />
              <span>Win</span>
            </div>
            <p className="text-2xl font-bold">{winRate}%</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => onViewProfile?.(player.id)}
          data-testid={`button-view-player-${player.id}`}
        >
          Vedi Profilo
        </Button>
      </CardContent>
    </Card>
  );
}
