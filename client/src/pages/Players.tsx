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

interface Club {
  id: number;
  name: string;
  city: string;
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

// todo: remove mock functionality
const mockClubs: Club[] = [
  { id: 1, name: "Padel Club Milano Centro", city: "Milano" },
  { id: 2, name: "Padel Club Milano Nord", city: "Milano" },
  { id: 3, name: "Padel Club Roma Sud", city: "Roma" },
];

const mockPlayers: Player[] = [
  { id: 1, firstName: "Marco", lastName: "Rossi", profileImageUrl: null, gender: 'male', level: 'intermediate', points: 1250, ranking: 1, matchesPlayed: 24, wins: 18, clubId: 1, clubName: "Padel Club Milano Centro" },
  { id: 2, firstName: "Luca", lastName: "Bianchi", profileImageUrl: null, gender: 'male', level: 'intermediate', points: 1180, ranking: 2, matchesPlayed: 22, wins: 16, clubId: 2, clubName: "Padel Club Milano Nord" },
  { id: 3, firstName: "Andrea", lastName: "Verdi", profileImageUrl: null, gender: 'male', level: 'advanced', points: 1050, ranking: 3, matchesPlayed: 20, wins: 14, clubId: 3, clubName: "Padel Club Roma Sud" },
  { id: 4, firstName: "Giuseppe", lastName: "Ferrari", profileImageUrl: null, gender: 'male', level: 'beginner', points: 580, ranking: 4, matchesPlayed: 12, wins: 7, clubId: 1, clubName: "Padel Club Milano Centro" },
  { id: 11, firstName: "Giulia", lastName: "Martini", profileImageUrl: null, gender: 'female', level: 'intermediate', points: 1150, ranking: 1, matchesPlayed: 20, wins: 16, clubId: 1, clubName: "Padel Club Milano Centro" },
  { id: 12, firstName: "Chiara", lastName: "Conti", profileImageUrl: null, gender: 'female', level: 'advanced', points: 1080, ranking: 2, matchesPlayed: 18, wins: 14, clubId: 3, clubName: "Padel Club Roma Sud" },
  { id: 13, firstName: "Sara", lastName: "Esposito", profileImageUrl: null, gender: 'female', level: 'beginner', points: 520, ranking: 3, matchesPlayed: 10, wins: 6, clubId: 2, clubName: "Padel Club Milano Nord" },
  { id: 14, firstName: "Elena", lastName: "Moretti", profileImageUrl: null, gender: 'female', level: 'intermediate', points: 950, ranking: 4, matchesPlayed: 15, wins: 11, clubId: 1, clubName: "Padel Club Milano Centro" },
];

export default function Players() {
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [clubFilter, setClubFilter] = useState<string>("all");

  const filteredPlayers = mockPlayers.filter((player) => {
    const matchesSearch = search === "" || 
      `${player.firstName} ${player.lastName}`.toLowerCase().includes(search.toLowerCase());
    const matchesGender = genderFilter === 'all' || player.gender === genderFilter;
    const matchesLevel = levelFilter === 'all' || player.level === levelFilter;
    const matchesClub = clubFilter === 'all' || player.clubId === parseInt(clubFilter);
    return matchesSearch && matchesGender && matchesLevel && matchesClub;
  });

  const selectedClub = clubFilter !== 'all' ? mockClubs.find(c => c.id === parseInt(clubFilter)) : null;

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
                {mockClubs.map((club) => (
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

        {filteredPlayers.length > 0 ? (
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
          <div className="text-center py-16 text-muted-foreground">
            Nessun giocatore trovato
          </div>
        )}
      </div>
    </div>
  );
}
