import { useState } from "react";
import { Calendar, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TournamentCard, type Tournament } from "@/components/TournamentCard";
import { CreateTournamentDialog } from "@/components/CreateTournamentDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TournamentsProps {
  isAdmin?: boolean;
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
    registrationType: 'couple',
    format: 'bracket',
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
    registrationType: 'couple',
    format: 'bracket',
  },
  {
    id: 3,
    name: "Round Robin Principianti",
    date: new Date("2024-04-28"),
    location: "Padel Arena Napoli",
    level: 'beginner',
    gender: 'female',
    maxParticipants: 8,
    currentParticipants: 5,
    status: 'open',
    pointsMultiplier: 1,
    registrationType: 'individual',
    format: 'round_robin',
  },
  {
    id: 4,
    name: "Master Cup Inverno",
    date: new Date("2024-02-10"),
    location: "Padel Center Torino",
    level: 'advanced',
    gender: 'male',
    maxParticipants: 16,
    currentParticipants: 16,
    status: 'completed',
    pointsMultiplier: 3,
    registrationType: 'couple',
    format: 'bracket',
  },
  {
    id: 5,
    name: "Ladies Open Round Robin",
    date: new Date("2024-03-08"),
    location: "Tennis Club Firenze",
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

export default function Tournaments({ isAdmin = false }: TournamentsProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [registrationTypeFilter, setRegistrationTypeFilter] = useState<string>("all");
  const [formatFilter, setFormatFilter] = useState<string>("all");

  const filteredTournaments = mockTournaments.filter((t) => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (levelFilter !== "all" && t.level !== levelFilter) return false;
    if (genderFilter !== "all" && t.gender !== genderFilter) return false;
    if (registrationTypeFilter !== "all" && t.registrationType !== registrationTypeFilter) return false;
    if (formatFilter !== "all" && t.format !== formatFilter) return false;
    return true;
  });

  const openTournaments = filteredTournaments.filter(t => t.status === 'open');
  const inProgressTournaments = filteredTournaments.filter(t => t.status === 'in_progress');
  const completedTournaments = filteredTournaments.filter(t => t.status === 'completed');

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-page-title">
              <Calendar className="h-8 w-8 text-primary" />
              Tornei
            </h1>
            <p className="text-muted-foreground mt-1">
              Esplora e iscriviti ai tornei disponibili
            </p>
          </div>
          {isAdmin && (
            <CreateTournamentDialog 
              onSubmit={(data) => console.log('Tournament created:', data)}
            />
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca tornei..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              data-testid="input-search-tournaments"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[140px]" data-testid="select-level-filter">
                <SelectValue placeholder="Livello" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i livelli</SelectItem>
                <SelectItem value="beginner">Principiante</SelectItem>
                <SelectItem value="intermediate">Intermedio</SelectItem>
                <SelectItem value="advanced">Avanzato</SelectItem>
              </SelectContent>
            </Select>
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="w-[140px]" data-testid="select-gender-filter">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte</SelectItem>
                <SelectItem value="male">Maschile</SelectItem>
                <SelectItem value="female">Femminile</SelectItem>
                <SelectItem value="mixed">Misto</SelectItem>
              </SelectContent>
            </Select>
            <Select value={registrationTypeFilter} onValueChange={setRegistrationTypeFilter}>
              <SelectTrigger className="w-[140px]" data-testid="select-registration-type-filter">
                <SelectValue placeholder="Iscrizione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte</SelectItem>
                <SelectItem value="couple">A Coppia</SelectItem>
                <SelectItem value="individual">Individuale</SelectItem>
              </SelectContent>
            </Select>
            <Select value={formatFilter} onValueChange={setFormatFilter}>
              <SelectTrigger className="w-[140px]" data-testid="select-format-filter">
                <SelectValue placeholder="Formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti</SelectItem>
                <SelectItem value="bracket">Tabellone</SelectItem>
                <SelectItem value="round_robin">Tutti vs Tutti</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="open" className="space-y-6">
          <TabsList>
            <TabsTrigger value="open" className="gap-2" data-testid="tab-open">
              Iscrizioni Aperte
              <Badge variant="secondary">{openTournaments.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="gap-2" data-testid="tab-in-progress">
              In Corso
              <Badge variant="secondary">{inProgressTournaments.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2" data-testid="tab-completed">
              Conclusi
              <Badge variant="secondary">{completedTournaments.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="open">
            {openTournaments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {openTournaments.map((tournament) => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    onRegister={(id) => console.log('Register for:', id)}
                    onViewDetails={(id) => console.log('View details:', id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                Nessun torneo con iscrizioni aperte
              </div>
            )}
          </TabsContent>

          <TabsContent value="in_progress">
            {inProgressTournaments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inProgressTournaments.map((tournament) => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    onViewDetails={(id) => console.log('View details:', id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                Nessun torneo in corso
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completedTournaments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedTournaments.map((tournament) => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    onViewDetails={(id) => console.log('View details:', id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                Nessun torneo concluso
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
