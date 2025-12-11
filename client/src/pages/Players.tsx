import { useState } from "react";
import { Users, Search, Building2, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayerCard } from "@/components/PlayerCard";
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

interface Player {
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
  clubId: number;
  clubName: string;
}

export default function Players() {
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [clubFilter, setClubFilter] = useState<string>("all");

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

  const players: Player[] = playersData.map((p, index) => {
    const club = clubsData.find(c => c.id === p.clubId);
    return {
      id: index + 1,
      firstName: p.firstName,
      lastName: p.lastName,
      profileImageUrl: null,
      gender: p.gender as 'male' | 'female',
      level: p.level as 'beginner' | 'intermediate' | 'advanced',
      points: p.totalPoints,
      ranking: 0,
      matchesPlayed: 0,
      wins: 0,
      clubId: p.clubId || 0,
      clubName: club?.name || "Nessuna sede",
    };
  });

  const filteredPlayers = players.filter((player) => {
    const matchesSearch = search === "" || 
      `${player.firstName} ${player.lastName}`.toLowerCase().includes(search.toLowerCase());
    const matchesGender = genderFilter === 'all' || player.gender === genderFilter;
    const matchesLevel = levelFilter === 'all' || player.level === levelFilter;
    const matchesClub = clubFilter === 'all' || player.clubId === parseInt(clubFilter);
    return matchesSearch && matchesGender && matchesLevel && matchesClub;
  });

  const selectedClub = clubFilter !== 'all' ? clubs.find(c => c.id === parseInt(clubFilter)) : null;

  const isLoading = clubsLoading || playersLoading;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <Users className="h-8 w-8 text-primary" />
            Giocatori
          </h1>
          <p className="text-muted-foreground mt-1">
            Esplora i profili dei giocatori registrati
          </p>
        </div>

        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca giocatori..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                data-testid="input-search-players"
              />
            </div>
            <Select value={clubFilter} onValueChange={setClubFilter}>
              <SelectTrigger className="w-full md:w-[280px]" data-testid="select-club-filter">
                <SelectValue placeholder="Tutte le sedi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <span className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Tutte le sedi
                  </span>
                </SelectItem>
                {clubs.map((club) => (
                  <SelectItem key={club.id} value={String(club.id)}>
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {club.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Tabs value={genderFilter} onValueChange={(v) => setGenderFilter(v as 'all' | 'male' | 'female')}>
              <TabsList>
                <TabsTrigger value="all" data-testid="tab-all-genders">Tutti</TabsTrigger>
                <TabsTrigger value="male" data-testid="tab-male">Uomini</TabsTrigger>
                <TabsTrigger value="female" data-testid="tab-female">Donne</TabsTrigger>
              </TabsList>
            </Tabs>
            <Tabs value={levelFilter} onValueChange={(v) => setLevelFilter(v as 'all' | 'beginner' | 'intermediate' | 'advanced')}>
              <TabsList>
                <TabsTrigger value="all" data-testid="tab-all-levels">Tutti</TabsTrigger>
                <TabsTrigger value="beginner" data-testid="tab-beginner">Princ.</TabsTrigger>
                <TabsTrigger value="intermediate" data-testid="tab-intermediate">Interm.</TabsTrigger>
                <TabsTrigger value="advanced" data-testid="tab-advanced">Avanz.</TabsTrigger>
              </TabsList>
            </Tabs>
            {selectedClub && (
              <Badge variant="outline" className="gap-1">
                <Building2 className="h-3 w-3" />
                {selectedClub.city}
              </Badge>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">
            Caricamento giocatori...
          </div>
        ) : filteredPlayers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                onViewProfile={(id) => console.log('View profile:', id)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nessun giocatore</h3>
              <p className="text-muted-foreground">
                Nessun giocatore trovato per i filtri selezionati.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
