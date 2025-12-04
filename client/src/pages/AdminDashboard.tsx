import { useState } from "react";
import { Shield, Users, Calendar, Trophy, Target, Plus, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/StatsCard";
import { TournamentCard, type Tournament } from "@/components/TournamentCard";
import { CreateTournamentDialog } from "@/components/CreateTournamentDialog";

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
  {
    id: 5,
    name: "Ladies Open",
    date: new Date("2024-03-08"),
    location: "Tennis Club Firenze",
    level: 'intermediate',
    gender: 'female',
    maxParticipants: 16,
    currentParticipants: 16,
    status: 'in_progress',
    pointsMultiplier: 2,
  },
];

interface RecentPlayer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  joinedAt: Date;
  level: 'beginner' | 'intermediate' | 'advanced';
}

const mockRecentPlayers: RecentPlayer[] = [
  { id: 1, firstName: "Marco", lastName: "Rossi", email: "marco@email.com", joinedAt: new Date("2024-03-20"), level: 'intermediate' },
  { id: 2, firstName: "Giulia", lastName: "Martini", email: "giulia@email.com", joinedAt: new Date("2024-03-19"), level: 'beginner' },
  { id: 3, firstName: "Luca", lastName: "Bianchi", email: "luca@email.com", joinedAt: new Date("2024-03-18"), level: 'advanced' },
];

const levelLabels = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzato',
};

export default function AdminDashboard() {
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-page-title">
              <Shield className="h-8 w-8 text-primary" />
              Dashboard Admin
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestisci tornei, giocatori e risultati
            </p>
          </div>
          <CreateTournamentDialog 
            onSubmit={(data) => console.log('Tournament created:', data)}
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard 
            title="Giocatori Totali"
            value={156}
            icon={Users}
            trend={{ value: 12, label: "questo mese", positive: true }}
          />
          <StatsCard 
            title="Tornei Attivi"
            value={4}
            icon={Calendar}
            subtitle="2 iscrizioni aperte"
          />
          <StatsCard 
            title="Partite Totali"
            value={342}
            icon={Target}
            trend={{ value: 8, label: "questa settimana", positive: true }}
          />
          <StatsCard 
            title="Punti Assegnati"
            value="12.5K"
            icon={Trophy}
          />
        </div>

        <Tabs defaultValue="tournaments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="tournaments" className="gap-2" data-testid="tab-admin-tournaments">
              <Calendar className="h-4 w-4" />
              Tornei
            </TabsTrigger>
            <TabsTrigger value="players" className="gap-2" data-testid="tab-admin-players">
              <Users className="h-4 w-4" />
              Giocatori
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tournaments" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca tornei..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-admin-tournaments"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTournaments.map((tournament) => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  onViewDetails={(id) => console.log('Manage tournament:', id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="players" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Nuovi Giocatori</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentPlayers.map((player) => (
                    <div 
                      key={player.id} 
                      className="flex items-center justify-between py-3 border-b last:border-0"
                      data-testid={`row-admin-player-${player.id}`}
                    >
                      <div>
                        <p className="font-medium">{player.firstName} {player.lastName}</p>
                        <p className="text-sm text-muted-foreground">{player.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{levelLabels[player.level]}</Badge>
                        <Button variant="outline" size="sm" data-testid={`button-view-player-${player.id}`}>
                          Vedi
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
