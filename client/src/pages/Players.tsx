import { useState } from "react";
import { Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayerCard } from "@/components/PlayerCard";

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
}

// todo: remove mock functionality
const mockPlayers: Player[] = [
  { id: 1, firstName: "Marco", lastName: "Rossi", profileImageUrl: null, gender: 'male', level: 'intermediate', points: 1250, ranking: 1, matchesPlayed: 24, wins: 18 },
  { id: 2, firstName: "Luca", lastName: "Bianchi", profileImageUrl: null, gender: 'male', level: 'intermediate', points: 1180, ranking: 2, matchesPlayed: 22, wins: 16 },
  { id: 3, firstName: "Andrea", lastName: "Verdi", profileImageUrl: null, gender: 'male', level: 'advanced', points: 1050, ranking: 3, matchesPlayed: 20, wins: 14 },
  { id: 4, firstName: "Giuseppe", lastName: "Ferrari", profileImageUrl: null, gender: 'male', level: 'beginner', points: 580, ranking: 4, matchesPlayed: 12, wins: 7 },
  { id: 11, firstName: "Giulia", lastName: "Martini", profileImageUrl: null, gender: 'female', level: 'intermediate', points: 1150, ranking: 1, matchesPlayed: 20, wins: 16 },
  { id: 12, firstName: "Chiara", lastName: "Conti", profileImageUrl: null, gender: 'female', level: 'advanced', points: 1080, ranking: 2, matchesPlayed: 18, wins: 14 },
  { id: 13, firstName: "Sara", lastName: "Esposito", profileImageUrl: null, gender: 'female', level: 'beginner', points: 520, ranking: 3, matchesPlayed: 10, wins: 6 },
  { id: 14, firstName: "Elena", lastName: "Moretti", profileImageUrl: null, gender: 'female', level: 'intermediate', points: 950, ranking: 4, matchesPlayed: 15, wins: 11 },
];

export default function Players() {
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  const filteredPlayers = mockPlayers.filter((player) => {
    const matchesSearch = search === "" || 
      `${player.firstName} ${player.lastName}`.toLowerCase().includes(search.toLowerCase());
    const matchesGender = genderFilter === 'all' || player.gender === genderFilter;
    const matchesLevel = levelFilter === 'all' || player.level === levelFilter;
    return matchesSearch && matchesGender && matchesLevel;
  });

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

        <div className="flex flex-col md:flex-row gap-4 mb-8">
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
          <div className="flex flex-col sm:flex-row gap-4">
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
