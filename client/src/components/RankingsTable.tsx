import { useState } from "react";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface RankedPlayer {
  id: number;
  position: number;
  previousPosition: number | null;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  points: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
}

interface RankingsTableProps {
  players: RankedPlayer[];
  gender: 'male' | 'female';
  level: 'beginner' | 'intermediate' | 'advanced';
  onGenderChange: (gender: 'male' | 'female') => void;
  onLevelChange: (level: 'beginner' | 'intermediate' | 'advanced') => void;
}

const levelLabels = {
  beginner: 'Principianti',
  intermediate: 'Intermedi',
  advanced: 'Avanzati',
};

export function RankingsTable({ players, gender, level, onGenderChange, onLevelChange }: RankingsTableProps) {
  const getPositionChange = (current: number, previous: number | null) => {
    if (previous === null) return { icon: Minus, color: "text-muted-foreground", label: "Nuovo" };
    const diff = previous - current;
    if (diff > 0) return { icon: TrendingUp, color: "text-green-500", label: `+${diff}` };
    if (diff < 0) return { icon: TrendingDown, color: "text-red-500", label: `${diff}` };
    return { icon: Minus, color: "text-muted-foreground", label: "=" };
  };

  const getPositionBadge = (position: number) => {
    if (position === 1) return "bg-yellow-500 text-black";
    if (position === 2) return "bg-gray-400 text-black";
    if (position === 3) return "bg-amber-600 text-white";
    return "";
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Classifica
          </CardTitle>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Tabs value={gender} onValueChange={(v) => onGenderChange(v as 'male' | 'female')} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="male" data-testid="tab-gender-male">Maschile</TabsTrigger>
              <TabsTrigger value="female" data-testid="tab-gender-female">Femminile</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Tabs value={level} onValueChange={(v) => onLevelChange(v as 'beginner' | 'intermediate' | 'advanced')} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="beginner" data-testid="tab-level-beginner">Principianti</TabsTrigger>
              <TabsTrigger value="intermediate" data-testid="tab-level-intermediate">Intermedi</TabsTrigger>
              <TabsTrigger value="advanced" data-testid="tab-level-advanced">Avanzati</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 pl-4 w-16">#</th>
                <th className="pb-3">Giocatore</th>
                <th className="pb-3 text-right">Punti</th>
                <th className="pb-3 text-right">Partite</th>
                <th className="pb-3 text-right">V/S</th>
                <th className="pb-3 text-right pr-4">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => {
                const change = getPositionChange(player.position, player.previousPosition);
                const winRate = player.matchesPlayed > 0 
                  ? Math.round((player.wins / player.matchesPlayed) * 100) 
                  : 0;
                
                return (
                  <tr 
                    key={player.id} 
                    className={cn(
                      "border-b last:border-0",
                      index % 2 === 0 && "bg-muted/30"
                    )}
                    data-testid={`row-player-${player.id}`}
                  >
                    <td className="py-3 pl-4">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold",
                          getPositionBadge(player.position)
                        )}>
                          {player.position}
                        </span>
                        <span className={cn("flex items-center text-xs", change.color)}>
                          <change.icon className="h-3 w-3" />
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={player.profileImageUrl || undefined} className="object-cover" />
                          <AvatarFallback>
                            {player.firstName[0]}{player.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {player.firstName} {player.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-right font-bold text-lg" data-testid={`text-points-${player.id}`}>
                      {player.points}
                    </td>
                    <td className="py-3 text-right text-muted-foreground">
                      {player.matchesPlayed}
                    </td>
                    <td className="py-3 text-right text-muted-foreground">
                      {player.wins}/{player.losses}
                    </td>
                    <td className="py-3 text-right pr-4">
                      <Badge variant={winRate >= 50 ? "default" : "secondary"}>
                        {winRate}%
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3">
          {players.map((player) => {
            const change = getPositionChange(player.position, player.previousPosition);
            const winRate = player.matchesPlayed > 0 
              ? Math.round((player.wins / player.matchesPlayed) * 100) 
              : 0;
            
            return (
              <Card key={player.id} className="p-4" data-testid={`card-player-${player.id}`}>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold",
                    getPositionBadge(player.position) || "bg-muted"
                  )}>
                    {player.position}
                  </div>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={player.profileImageUrl || undefined} className="object-cover" />
                    <AvatarFallback>
                      {player.firstName[0]}{player.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {player.firstName} {player.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {player.wins}V / {player.losses}S
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{player.points}</p>
                    <Badge variant={winRate >= 50 ? "default" : "secondary"} className="text-xs">
                      {winRate}%
                    </Badge>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        
        {players.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Nessun giocatore in questa categoria
          </div>
        )}
      </CardContent>
    </Card>
  );
}
