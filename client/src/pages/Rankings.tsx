import { useState } from "react";
import { Trophy, Globe, Building2 } from "lucide-react";
import { RankingsTable, type RankedPlayer } from "@/components/RankingsTable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface Club {
  id: number;
  name: string;
  city: string;
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

interface RankedPlayerWithClub extends RankedPlayer {
  clubId: number | null;
  clubName: string;
}

export default function Rankings() {
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [scope, setScope] = useState<'global' | 'local'>('global');
  const [selectedClubId, setSelectedClubId] = useState<string>("1");

  const { data: clubsData = [], isLoading: clubsLoading } = useQuery<ClubFromAPI[]>({
    queryKey: ['/api/clubs'],
  });

  const { data: playersData = [], isLoading: playersLoading } = useQuery<PlayerFromAPI[]>({
    queryKey: ['/api/players'],
  });

  const clubs: Club[] = clubsData.map(c => ({
    id: c.id,
    name: c.name,
    city: c.city,
  }));

  const allPlayers: RankedPlayerWithClub[] = playersData
    .filter(p => p.gender === gender && p.level === level && p.emailVerified)
    .map((p, index) => {
      const club = clubsData.find(c => c.id === p.clubId);
      return {
        id: parseInt(p.id) || index + 1,
        position: index + 1,
        previousPosition: null,
        firstName: p.firstName,
        lastName: p.lastName,
        profileImageUrl: null,
        points: p.totalPoints,
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        clubId: p.clubId,
        clubName: club?.name || "Nessuna sede",
      };
    });
  
  const filteredPlayers = scope === 'global' 
    ? allPlayers 
    : allPlayers.filter(p => p.clubId === parseInt(selectedClubId));

  const sortedPlayers = [...filteredPlayers].sort((a, b) => b.points - a.points);

  const rankedPlayers = sortedPlayers.map((player, index) => ({
    ...player,
    position: index + 1,
  }));

  const selectedClub = clubs.find(c => c.id === parseInt(selectedClubId));

  const isLoading = clubsLoading || playersLoading;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <Trophy className="h-8 w-8 text-primary" />
            Classifiche
          </h1>
          <p className="text-muted-foreground mt-1">
            Classifiche ufficiali divise per genere e livello di gioco
          </p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Tabs value={scope} onValueChange={(v) => setScope(v as 'global' | 'local')}>
            <TabsList>
              <TabsTrigger value="global" className="gap-2" data-testid="tab-scope-global">
                <Globe className="h-4 w-4" />
                Globale
              </TabsTrigger>
              <TabsTrigger value="local" className="gap-2" data-testid="tab-scope-local">
                <Building2 className="h-4 w-4" />
                Per Sede
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {scope === 'local' && (
            <div className="flex items-center gap-2">
              <Select value={selectedClubId} onValueChange={setSelectedClubId}>
                <SelectTrigger className="w-[280px]" data-testid="select-club">
                  <SelectValue placeholder="Seleziona sede" />
                </SelectTrigger>
                <SelectContent>
                  {clubs.map((club) => (
                    <SelectItem key={club.id} value={String(club.id)}>
                      {club.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {scope === 'global' && (
            <Badge variant="secondary" className="gap-1">
              <Globe className="h-3 w-3" />
              Tutte le sedi ({clubs.length})
            </Badge>
          )}

          {scope === 'local' && selectedClub && (
            <Badge variant="outline" className="gap-1">
              <Building2 className="h-3 w-3" />
              {selectedClub.city}
            </Badge>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">
            Caricamento classifiche...
          </div>
        ) : rankedPlayers.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nessun giocatore</h3>
              <p className="text-muted-foreground">
                Non ci sono ancora giocatori registrati per questa categoria.
              </p>
            </CardContent>
          </Card>
        ) : (
          <RankingsTable
            players={rankedPlayers}
            gender={gender}
            level={level}
            onGenderChange={setGender}
            onLevelChange={setLevel}
          />
        )}
      </div>
    </div>
  );
}
