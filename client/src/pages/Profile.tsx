import { useState, useMemo } from "react";
import { User, Trophy, Calendar, Target, TrendingUp, Edit, Save, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatsCard } from "@/components/StatsCard";
import { MatchResultCard, type MatchResult } from "@/components/MatchResultCard";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Match } from "@shared/schema";

interface ProfileProps {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    profileImageUrl: string | null;
  };
}

interface PlayerFromAPI {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  level: string;
  clubId: number | null;
  totalPoints: number;
  emailVerified: boolean;
  role: string;
}

interface ClubFromAPI {
  id: number;
  name: string;
  address: string;
  city: string;
  courtsCount: number;
  rollingWeeks: number | null;
  createdAt: string;
}

export default function Profile({ user }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const { toast } = useToast();

  const { data: playerData } = useQuery<PlayerFromAPI>({
    queryKey: ['/api/players', user.id],
    enabled: !!user.id,
  });

  const { data: clubsData = [] } = useQuery<ClubFromAPI[]>({
    queryKey: ['/api/clubs'],
  });

  const { data: matchesData = [] } = useQuery<Match[]>({
    queryKey: ['/api/matches'],
  });

  const { data: playersData = [] } = useQuery<PlayerFromAPI[]>({
    queryKey: ['/api/players'],
  });

  const playerClub = useMemo(() => {
    if (!playerData?.clubId) return null;
    return clubsData.find(c => c.id === playerData.clubId);
  }, [playerData, clubsData]);

  const playerMap = useMemo(() => {
    return new Map(playersData.map(p => [p.id, p]));
  }, [playersData]);

  const recentMatches: MatchResult[] = useMemo(() => {
    return matchesData.slice(0, 3).map(match => {
      const getPlayer = (id: string | null) => {
        if (!id) return null;
        const player = playerMap.get(id);
        if (player) return { 
          id: 1,
          firstName: player.firstName, 
          lastName: player.lastName, 
          profileImageUrl: null 
        };
        return { id: 0, firstName: id.slice(0, 5), lastName: "...", profileImageUrl: null };
      };

      const team1: { id: number; firstName: string; lastName: string; profileImageUrl: string | null }[] = [];
      const team2: { id: number; firstName: string; lastName: string; profileImageUrl: string | null }[] = [];

      const p1 = getPlayer(match.team1Player1Id);
      if (p1) team1.push(p1);
      const p2 = getPlayer(match.team1Player2Id);
      if (p2) team1.push(p2);
      const p3 = getPlayer(match.team2Player1Id);
      if (p3) team2.push(p3);
      const p4 = getPlayer(match.team2Player2Id);
      if (p4) team2.push(p4);

      const score1: number[] = [match.set1Team1, match.set2Team1];
      const score2: number[] = [match.set1Team2, match.set2Team2];
      
      if (match.setsPlayed === 3 && match.set3Team1 !== null && match.set3Team2 !== null) {
        score1.push(match.set3Team1);
        score2.push(match.set3Team2);
      }

      return {
        id: match.id,
        date: new Date(match.playedAt),
        type: 'single' as const,
        team1,
        team2,
        score1,
        score2,
        winningSide: match.winnerTeam as 1 | 2,
        pointsAwarded: match.pointsAwarded,
      };
    });
  }, [matchesData, playerMap]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { gender: string; level: string }) => {
      return apiRequest('PATCH', `/api/players/${user.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/players', user.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      toast({
        title: "Profilo aggiornato",
        description: "Le modifiche sono state salvate",
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il profilo",
        variant: "destructive",
      });
    },
  });

  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return "U";
  };

  const handleSave = () => {
    updateProfileMutation.mutate({ gender, level });
  };

  const displayGender = playerData?.gender || gender;
  const displayLevel = playerData?.level || level;
  const totalPoints = playerData?.totalPoints || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <User className="h-8 w-8 text-primary" />
            Il Mio Profilo
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={user.profileImageUrl || undefined} className="object-cover" />
                    <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold" data-testid="text-user-name">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-muted-foreground text-sm">{user.email}</p>
                  <div className="flex gap-2 mt-3">
                    <Badge variant="outline">{displayGender === 'male' ? 'Maschile' : 'Femminile'}</Badge>
                    <Badge variant="outline">
                      {displayLevel === 'beginner' ? 'Principiante' : displayLevel === 'intermediate' ? 'Intermedio' : 'Avanzato'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Sede di Affiliazione
                </CardTitle>
              </CardHeader>
              <CardContent>
                {playerClub ? (
                  <div className="space-y-2">
                    <p className="font-medium" data-testid="text-club-name">{playerClub.name}</p>
                    <p className="text-sm text-muted-foreground">{playerClub.address}</p>
                    <p className="text-sm text-muted-foreground">{playerClub.city}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nessuna sede assegnata</p>
                )}
                <p className="text-xs text-muted-foreground mt-4">
                  Puoi partecipare ai tornei di tutte le sedi della catena
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle>Informazioni</CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  disabled={updateProfileMutation.isPending}
                  data-testid={isEditing ? "button-save-profile" : "button-edit-profile"}
                >
                  {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={gender} onValueChange={(v) => setGender(v as 'male' | 'female')} disabled={!isEditing}>
                    <SelectTrigger data-testid="select-profile-gender">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Maschile</SelectItem>
                      <SelectItem value="female">Femminile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Livello</Label>
                  <Select value={level} onValueChange={(v) => setLevel(v as 'beginner' | 'intermediate' | 'advanced')} disabled={!isEditing}>
                    <SelectTrigger data-testid="select-profile-level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Principiante</SelectItem>
                      <SelectItem value="intermediate">Intermedio</SelectItem>
                      <SelectItem value="advanced">Avanzato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard 
                title="Posizione"
                value="-"
                icon={Trophy}
              />
              <StatsCard 
                title="Punti"
                value={totalPoints}
                icon={Target}
              />
              <StatsCard 
                title="Partite"
                value={matchesData.length}
                icon={Calendar}
              />
              <StatsCard 
                title="Win Rate"
                value="-"
                icon={TrendingUp}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Ultime Partite</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentMatches.length > 0 ? (
                  recentMatches.map((match) => (
                    <MatchResultCard 
                      key={match.id} 
                      match={match}
                      highlightPlayerId={1}
                    />
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nessuna partita registrata
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
