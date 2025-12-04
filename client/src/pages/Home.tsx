import { useState } from "react";
import { Link } from "wouter";
import { Trophy, Calendar, Target, TrendingUp, ChevronRight, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/StatsCard";
import { TournamentCard, type Tournament } from "@/components/TournamentCard";
import { MatchResultCard, type MatchResult } from "@/components/MatchResultCard";
import { AddMatchDialog } from "@/components/AddMatchDialog";

interface HomeProps {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  };
}

// todo: remove mock functionality
const mockTournaments: Tournament[] = [
  {
    id: 1,
    name: "Torneo Primavera 2024",
    date: new Date("2024-04-15"),
    location: "Padel Club Milano",
    level: 'intermediate',
    gender: 'mixed',
    maxParticipants: 16,
    currentParticipants: 12,
    status: 'open',
    pointsMultiplier: 2,
  },
  {
    id: 2,
    name: "Campionato Regionale",
    date: new Date("2024-04-22"),
    location: "Centro Sportivo Roma",
    level: 'advanced',
    gender: 'male',
    maxParticipants: 32,
    currentParticipants: 28,
    status: 'open',
    pointsMultiplier: 3,
  },
];

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
];

const mockPlayers = [
  { id: 1, firstName: "Marco", lastName: "Rossi" },
  { id: 2, firstName: "Luca", lastName: "Bianchi" },
  { id: 3, firstName: "Andrea", lastName: "Verdi" },
  { id: 4, firstName: "Giuseppe", lastName: "Ferrari" },
  { id: 5, firstName: "Paolo", lastName: "Romano" },
  { id: 6, firstName: "Matteo", lastName: "Greco" },
];

export default function Home({ user }: HomeProps) {
  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return "U";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.profileImageUrl || undefined} className="object-cover" />
              <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-welcome">
                Ciao, {user.firstName || "Giocatore"}!
              </h1>
              <p className="text-muted-foreground">
                Benvenuto nella tua dashboard
              </p>
            </div>
          </div>
          <AddMatchDialog 
            players={mockPlayers}
            onSubmit={(data) => console.log('Match submitted:', data)}
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard 
            title="Posizione"
            value="#12"
            subtitle="Categoria Intermedi"
            icon={Trophy}
          />
          <StatsCard 
            title="Punti"
            value={850}
            icon={Target}
            trend={{ value: 15, label: "ultimo mese", positive: true }}
          />
          <StatsCard 
            title="Partite"
            value={24}
            subtitle="18 vittorie"
            icon={Calendar}
          />
          <StatsCard 
            title="Win Rate"
            value="75%"
            icon={TrendingUp}
            trend={{ value: 5, label: "ultimo mese", positive: true }}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
                <CardTitle>Ultime Partite</CardTitle>
                <Link href="/my-matches">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Vedi Tutte
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockMatches.map((match) => (
                  <MatchResultCard 
                    key={match.id} 
                    match={match} 
                    highlightPlayerId={1}
                  />
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
                <CardTitle>Tornei Disponibili</CardTitle>
                <Link href="/tournaments">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Tutti
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockTournaments.slice(0, 2).map((tournament) => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    onRegister={(id) => console.log('Register for:', id)}
                    onViewDetails={(id) => console.log('View details:', id)}
                  />
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>La Tua Classifica</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Maschile - Intermedi</span>
                    <Badge variant="secondary">#12</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Punti totali</span>
                      <span className="font-medium">850</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Partite giocate</span>
                      <span className="font-medium">24</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Vittorie/Sconfitte</span>
                      <span className="font-medium">18/6</span>
                    </div>
                  </div>
                  <Link href="/rankings">
                    <Button variant="outline" className="w-full gap-2">
                      <Trophy className="h-4 w-4" />
                      Vedi Classifica Completa
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
