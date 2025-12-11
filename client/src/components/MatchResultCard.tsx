import { Calendar, Trophy, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Player {
  id: number;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
}

export interface MatchResult {
  id: number;
  date: Date;
  type: 'tournament' | 'single';
  tournamentName?: string;
  team1: Player[];
  team2: Player[];
  score1: number[];
  score2: number[];
  winningSide: 1 | 2;
  pointsAwarded: number;
}

interface MatchResultCardProps {
  match: MatchResult;
  highlightPlayerId?: number;
}

export function MatchResultCard({ match, highlightPlayerId }: MatchResultCardProps) {
  const isPlayerInTeam1 = match.team1.some(p => p.id === highlightPlayerId);
  const isPlayerInTeam2 = match.team2.some(p => p.id === highlightPlayerId);
  const playerWon = (isPlayerInTeam1 && match.winningSide === 1) || (isPlayerInTeam2 && match.winningSide === 2);

  const formatScore = (score1: number[], score2: number[]) => {
    return score1.map((s, i) => `${s}-${score2[i]}`).join(" / ");
  };

  const getTeamDisplay = (team: Player[], isWinner: boolean) => (
    <div className={cn(
      "flex items-center gap-2",
      isWinner && "font-bold"
    )}>
      <div className="flex -space-x-2">
        {team.map((player) => (
          <Avatar key={player.id} className="h-8 w-8 border-2 border-background">
            <AvatarImage src={player.profileImageUrl || undefined} className="object-cover" />
            <AvatarFallback className="text-xs">
              {player.firstName[0]}{player.lastName[0]}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <div className="text-sm">
        {team.map(p => `${p.firstName} ${p.lastName[0]}.`).join(" / ")}
      </div>
      {isWinner && <Trophy className="h-4 w-4 text-primary" />}
    </div>
  );

  return (
    <Card className={cn(
      "hover-elevate",
      highlightPlayerId && (playerWon ? "border-l-4 border-l-green-500" : "border-l-4 border-l-red-500")
    )} data-testid={`card-match-${match.id}`}>
      <CardContent className="pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(match.date, "d MMMM yyyy", { locale: it })}</span>
              <Badge variant={match.type === 'tournament' ? 'default' : 'secondary'}>
                {match.type === 'tournament' ? 'Torneo' : 'Partita Singola'}
              </Badge>
              {match.tournamentName && (
                <span className="font-medium">{match.tournamentName}</span>
              )}
            </div>
            
            <div className="space-y-2">
              {getTeamDisplay(match.team1, match.winningSide === 1)}
              <div className="text-xs text-muted-foreground pl-10">vs</div>
              {getTeamDisplay(match.team2, match.winningSide === 2)}
            </div>
          </div>
          
          <div className="text-right space-y-1">
            <div className="text-2xl font-bold tabular-nums" data-testid={`text-score-${match.id}`}>
              {formatScore(match.score1, match.score2)}
            </div>
            <div className="flex items-center justify-end gap-1 text-sm" data-testid={`text-points-${match.id}`}>
              <Star className="h-3.5 w-3.5 text-muted-foreground" />
              <span className={cn(
                "font-medium",
                highlightPlayerId && playerWon && "text-green-600 dark:text-green-400"
              )}>
                {highlightPlayerId && playerWon ? "+" : ""}{match.pointsAwarded} pt
              </span>
            </div>
            {match.type === 'single' && (
              <div className="text-xs text-muted-foreground">
                {match.score1.length === 2 ? "2 set (1/5)" : "3 set (1/6)"}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
