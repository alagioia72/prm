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

interface Club {
  id: number;
  name: string;
  city: string;
}

// todo: remove mock functionality
const mockClubs: Club[] = [
  { id: 1, name: "Padel Club Milano Centro", city: "Milano" },
  { id: 2, name: "Padel Club Milano Nord", city: "Milano" },
  { id: 3, name: "Padel Club Roma Sud", city: "Roma" },
];

interface RankedPlayerWithClub extends RankedPlayer {
  clubId: number;
  clubName: string;
}

const mockMalePlayers: RankedPlayerWithClub[] = [
  { id: 1, position: 1, previousPosition: 2, firstName: "Marco", lastName: "Rossi", profileImageUrl: null, points: 1250, matchesPlayed: 24, wins: 18, losses: 6, clubId: 1, clubName: "Padel Club Milano Centro" },
  { id: 2, position: 2, previousPosition: 1, firstName: "Luca", lastName: "Bianchi", profileImageUrl: null, points: 1180, matchesPlayed: 22, wins: 16, losses: 6, clubId: 2, clubName: "Padel Club Milano Nord" },
  { id: 3, position: 3, previousPosition: 3, firstName: "Andrea", lastName: "Verdi", profileImageUrl: null, points: 1050, matchesPlayed: 20, wins: 14, losses: 6, clubId: 3, clubName: "Padel Club Roma Sud" },
  { id: 4, position: 4, previousPosition: 6, firstName: "Giuseppe", lastName: "Ferrari", profileImageUrl: null, points: 980, matchesPlayed: 18, wins: 12, losses: 6, clubId: 1, clubName: "Padel Club Milano Centro" },
  { id: 5, position: 5, previousPosition: null, firstName: "Paolo", lastName: "Romano", profileImageUrl: null, points: 920, matchesPlayed: 15, wins: 10, losses: 5, clubId: 3, clubName: "Padel Club Roma Sud" },
  { id: 6, position: 6, previousPosition: 4, firstName: "Matteo", lastName: "Greco", profileImageUrl: null, points: 890, matchesPlayed: 16, wins: 10, losses: 6, clubId: 2, clubName: "Padel Club Milano Nord" },
  { id: 7, position: 7, previousPosition: 8, firstName: "Simone", lastName: "Marino", profileImageUrl: null, points: 820, matchesPlayed: 14, wins: 9, losses: 5, clubId: 1, clubName: "Padel Club Milano Centro" },
  { id: 8, position: 8, previousPosition: 5, firstName: "Francesco", lastName: "Costa", profileImageUrl: null, points: 780, matchesPlayed: 18, wins: 9, losses: 9, clubId: 3, clubName: "Padel Club Roma Sud" },
  { id: 9, position: 9, previousPosition: 9, firstName: "Alessandro", lastName: "Bruno", profileImageUrl: null, points: 720, matchesPlayed: 12, wins: 7, losses: 5, clubId: 2, clubName: "Padel Club Milano Nord" },
  { id: 10, position: 10, previousPosition: 11, firstName: "Davide", lastName: "Ricci", profileImageUrl: null, points: 680, matchesPlayed: 14, wins: 7, losses: 7, clubId: 1, clubName: "Padel Club Milano Centro" },
];

const mockFemalePlayers: RankedPlayerWithClub[] = [
  { id: 11, position: 1, previousPosition: 1, firstName: "Giulia", lastName: "Martini", profileImageUrl: null, points: 1150, matchesPlayed: 20, wins: 16, losses: 4, clubId: 1, clubName: "Padel Club Milano Centro" },
  { id: 12, position: 2, previousPosition: 3, firstName: "Chiara", lastName: "Conti", profileImageUrl: null, points: 1080, matchesPlayed: 18, wins: 14, losses: 4, clubId: 3, clubName: "Padel Club Roma Sud" },
  { id: 13, position: 3, previousPosition: 2, firstName: "Sara", lastName: "Esposito", profileImageUrl: null, points: 1020, matchesPlayed: 19, wins: 13, losses: 6, clubId: 2, clubName: "Padel Club Milano Nord" },
  { id: 14, position: 4, previousPosition: null, firstName: "Elena", lastName: "Moretti", profileImageUrl: null, points: 950, matchesPlayed: 15, wins: 11, losses: 4, clubId: 1, clubName: "Padel Club Milano Centro" },
  { id: 15, position: 5, previousPosition: 4, firstName: "Valentina", lastName: "Barbieri", profileImageUrl: null, points: 890, matchesPlayed: 16, wins: 10, losses: 6, clubId: 3, clubName: "Padel Club Roma Sud" },
];

export default function Rankings() {
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [scope, setScope] = useState<'global' | 'local'>('global');
  const [selectedClubId, setSelectedClubId] = useState<string>("1");

  const allPlayers = gender === 'male' ? mockMalePlayers : mockFemalePlayers;
  
  const filteredPlayers = scope === 'global' 
    ? allPlayers 
    : allPlayers.filter(p => p.clubId === parseInt(selectedClubId));

  const sortedPlayers = [...filteredPlayers].sort((a, b) => b.points - a.points);

  const rankedPlayers = sortedPlayers.map((player, index) => ({
    ...player,
    position: index + 1,
  }));

  const selectedClub = mockClubs.find(c => c.id === parseInt(selectedClubId));

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
                  {mockClubs.map((club) => (
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
              Tutte le sedi ({mockClubs.length})
            </Badge>
          )}

          {scope === 'local' && selectedClub && (
            <Badge variant="outline" className="gap-1">
              <Building2 className="h-3 w-3" />
              {selectedClub.city}
            </Badge>
          )}
        </div>

        <RankingsTable
          players={rankedPlayers}
          gender={gender}
          level={level}
          onGenderChange={setGender}
          onLevelChange={setLevel}
        />
      </div>
    </div>
  );
}
