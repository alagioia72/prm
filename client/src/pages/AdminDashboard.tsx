import { useState } from "react";
import { Shield, Users, Calendar, Trophy, Target, Search, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/StatsCard";
import { TournamentCard, type Tournament } from "@/components/TournamentCard";
import { ClubCard, type Club } from "@/components/ClubCard";
import { CreateTournamentDialog } from "@/components/CreateTournamentDialog";
import { CreateClubDialog } from "@/components/CreateClubDialog";

// todo: remove mock functionality
const mockTournaments: Tournament[] = [
  {
    id: 1,
    name: "Torneo Primavera 2024",
    date: new Date("2024-04-15"),
    location: "Padel Club Milano Centro",
    level: 'intermediate',
    gender: 'mixed',
    maxParticipants: 16,
    currentParticipants: 12,
    status: 'open',
    pointsMultiplier: 2,
    registrationType: 'couple',
    format: 'bracket',
  },
  {
    id: 2,
    name: "Campionato Regionale",
    date: new Date("2024-04-22"),
    location: "Padel Club Roma Sud",
    level: 'advanced',
    gender: 'male',
    maxParticipants: 32,
    currentParticipants: 28,
    status: 'open',
    pointsMultiplier: 3,
    registrationType: 'couple',
    format: 'bracket',
  },
  {
    id: 5,
    name: "Ladies Open Round Robin",
    date: new Date("2024-03-08"),
    location: "Padel Club Milano Nord",
    level: 'intermediate',
    gender: 'female',
    maxParticipants: 16,
    currentParticipants: 16,
    status: 'in_progress',
    pointsMultiplier: 2,
    registrationType: 'couple',
    format: 'round_robin',
  },
];

const mockClubs: Club[] = [
  {
    id: 1,
    name: "Padel Club Milano Centro",
    address: "Via Montenapoleone 15",
    city: "Milano",
    province: "MI",
    playersCount: 85,
    tournamentsCount: 12,
    isMain: true,
  },
  {
    id: 2,
    name: "Padel Club Milano Nord",
    address: "Via Fulvio Testi 200",
    city: "Milano",
    province: "MI",
    playersCount: 42,
    tournamentsCount: 6,
    isMain: false,
  },
  {
    id: 3,
    name: "Padel Club Roma Sud",
    address: "Via Cristoforo Colombo 435",
    city: "Roma",
    province: "RM",
    playersCount: 67,
    tournamentsCount: 8,
    isMain: false,
  },
];

interface RecentPlayer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  joinedAt: Date;
  level: 'beginner' | 'intermediate' | 'advanced';
  clubName: string;
}

const mockRecentPlayers: RecentPlayer[] = [
  { id: 1, firstName: "Marco", lastName: "Rossi", email: "marco@email.com", joinedAt: new Date("2024-03-20"), level: 'intermediate', clubName: "Padel Club Milano Centro" },
  { id: 2, firstName: "Giulia", lastName: "Martini", email: "giulia@email.com", joinedAt: new Date("2024-03-19"), level: 'beginner', clubName: "Padel Club Roma Sud" },
  { id: 3, firstName: "Luca", lastName: "Bianchi", email: "luca@email.com", joinedAt: new Date("2024-03-18"), level: 'advanced', clubName: "Padel Club Milano Nord" },
];

const levelLabels = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzato',
};

export default function AdminDashboard() {
  const [search, setSearch] = useState("");
  const [clubSearch, setClubSearch] = useState("");

  const totalPlayers = mockClubs.reduce((sum, club) => sum + club.playersCount, 0);

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
              Gestisci sedi, tornei, giocatori e risultati
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatsCard 
            title="Sedi"
            value={mockClubs.length}
            icon={Building2}
            subtitle="Club nella catena"
          />
          <StatsCard 
            title="Giocatori Totali"
            value={totalPlayers}
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

        <Tabs defaultValue="clubs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="clubs" className="gap-2" data-testid="tab-admin-clubs">
              <Building2 className="h-4 w-4" />
              Sedi
            </TabsTrigger>
            <TabsTrigger value="tournaments" className="gap-2" data-testid="tab-admin-tournaments">
              <Calendar className="h-4 w-4" />
              Tornei
            </TabsTrigger>
            <TabsTrigger value="players" className="gap-2" data-testid="tab-admin-players">
              <Users className="h-4 w-4" />
              Giocatori
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clubs" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca sedi..."
                  value={clubSearch}
                  onChange={(e) => setClubSearch(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-clubs"
                />
              </div>
              <CreateClubDialog 
                onSubmit={(data) => console.log('Club created:', data)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockClubs
                .filter(club => 
                  !clubSearch || 
                  club.name.toLowerCase().includes(clubSearch.toLowerCase()) ||
                  club.city.toLowerCase().includes(clubSearch.toLowerCase())
                )
                .map((club) => (
                  <ClubCard
                    key={club.id}
                    club={club}
                    isAdmin
                    onEdit={(id) => console.log('Edit club:', id)}
                    onDelete={(id) => console.log('Delete club:', id)}
                    onViewDetails={(id) => console.log('View club:', id)}
                  />
                ))}
            </div>
          </TabsContent>

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
              <CreateTournamentDialog 
                onSubmit={(data) => console.log('Tournament created:', data)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTournaments
                .filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()))
                .map((tournament) => (
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
                        <p className="text-xs text-muted-foreground mt-0.5">{player.clubName}</p>
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
