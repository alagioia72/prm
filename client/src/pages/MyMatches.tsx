import { useState } from "react";
import { Trophy, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchResultCard, type MatchResult } from "@/components/MatchResultCard";
import { AddMatchDialog } from "@/components/AddMatchDialog";
import { Badge } from "@/components/ui/badge";

// todo: remove mock functionality
const mockMatches: MatchResult[] = [
  {
    id: 1,
    date: new Date("2024-03-20"),
    type: 'tournament',
    tournamentName: 'Torneo Inverno',
    team1: [
      { id: 1, firstName: "Marco", lastName: "Rossi", profileImageUrl: null },
      { id: 2, firstName: "Luca", lastName: "Bianchi", profileImageUrl: null },
    ],
    team2: [
      { id: 3, firstName: "Andrea", lastName: "Verdi", profileImageUrl: null },
      { id: 4, firstName: "Giuseppe", lastName: "Ferrari", profileImageUrl: null },
    ],
    score1: [6, 7],
    score2: [4, 5],
    winningSide: 1,
    pointsAwarded: 50,
  },
  {
    id: 2,
    date: new Date("2024-03-15"),
    type: 'single',
    team1: [
      { id: 1, firstName: "Marco", lastName: "Rossi", profileImageUrl: null },
      { id: 5, firstName: "Paolo", lastName: "Romano", profileImageUrl: null },
    ],
    team2: [
      { id: 6, firstName: "Matteo", lastName: "Greco", profileImageUrl: null },
      { id: 7, firstName: "Simone", lastName: "Marino", profileImageUrl: null },
    ],
    score1: [4, 6, 4],
    score2: [6, 3, 6],
    winningSide: 2,
    pointsAwarded: 25,
  },
  {
    id: 3,
    date: new Date("2024-03-10"),
    type: 'tournament',
    tournamentName: 'Torneo Inverno',
    team1: [
      { id: 1, firstName: "Marco", lastName: "Rossi", profileImageUrl: null },
      { id: 2, firstName: "Luca", lastName: "Bianchi", profileImageUrl: null },
    ],
    team2: [
      { id: 8, firstName: "Roberto", lastName: "Neri", profileImageUrl: null },
      { id: 9, firstName: "Carlo", lastName: "Gialli", profileImageUrl: null },
    ],
    score1: [6, 6],
    score2: [3, 4],
    winningSide: 1,
    pointsAwarded: 50,
  },
  {
    id: 4,
    date: new Date("2024-03-05"),
    type: 'single',
    team1: [
      { id: 1, firstName: "Marco", lastName: "Rossi", profileImageUrl: null },
      { id: 10, firstName: "Antonio", lastName: "Blu", profileImageUrl: null },
    ],
    team2: [
      { id: 11, firstName: "Stefano", lastName: "Rosa", profileImageUrl: null },
      { id: 12, firstName: "Fabio", lastName: "Viola", profileImageUrl: null },
    ],
    score1: [6, 7],
    score2: [4, 6],
    winningSide: 1,
    pointsAwarded: 25,
  },
];

const mockPlayers = [
  { id: 1, firstName: "Marco", lastName: "Rossi" },
  { id: 2, firstName: "Luca", lastName: "Bianchi" },
  { id: 3, firstName: "Andrea", lastName: "Verdi" },
  { id: 4, firstName: "Giuseppe", lastName: "Ferrari" },
  { id: 5, firstName: "Paolo", lastName: "Romano" },
  { id: 6, firstName: "Matteo", lastName: "Greco" },
];

export default function MyMatches() {
  const [filter, setFilter] = useState<'all' | 'tournament' | 'single'>('all');

  const filteredMatches = mockMatches.filter(match => {
    if (filter === 'all') return true;
    return match.type === filter;
  });

  const tournamentMatches = mockMatches.filter(m => m.type === 'tournament');
  const singleMatches = mockMatches.filter(m => m.type === 'single');

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-page-title">
              <Trophy className="h-8 w-8 text-primary" />
              Le Mie Partite
            </h1>
            <p className="text-muted-foreground mt-1">
              Storico delle tue partite giocate
            </p>
          </div>
          <AddMatchDialog 
            players={mockPlayers}
            onSubmit={(data) => console.log('Match submitted:', data)}
          />
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'tournament' | 'single')} className="space-y-6">
          <TabsList>
            <TabsTrigger value="all" className="gap-2" data-testid="tab-all-matches">
              Tutte
              <Badge variant="secondary">{mockMatches.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="tournament" className="gap-2" data-testid="tab-tournament-matches">
              Tornei
              <Badge variant="secondary">{tournamentMatches.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="single" className="gap-2" data-testid="tab-single-matches">
              Singole
              <Badge variant="secondary">{singleMatches.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            {filteredMatches.length > 0 ? (
              filteredMatches.map((match) => (
                <MatchResultCard 
                  key={match.id} 
                  match={match}
                  highlightPlayerId={1}
                />
              ))
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                Nessuna partita trovata
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
