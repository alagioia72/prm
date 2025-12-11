import { useState, useEffect } from "react";
import { Shield, Users, Calendar, Trophy, Target, Search, Building2, Star, Save, RotateCcw, Settings, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { StatsCard } from "@/components/StatsCard";
import { TournamentCard, type Tournament } from "@/components/TournamentCard";
import { ClubCard, type Club } from "@/components/ClubCard";
import { CreateTournamentDialog } from "@/components/CreateTournamentDialog";
import { CreateClubDialog } from "@/components/CreateClubDialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";

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

interface ScoringEntry {
  position: number;
  points: number;
}

const defaultScoringEntries: ScoringEntry[] = [
  { position: 1, points: 100 },
  { position: 2, points: 80 },
  { position: 3, points: 65 },
  { position: 4, points: 55 },
  { position: 5, points: 45 },
  { position: 6, points: 40 },
  { position: 7, points: 35 },
  { position: 8, points: 30 },
  { position: 9, points: 25 },
  { position: 10, points: 22 },
  { position: 11, points: 20 },
  { position: 12, points: 18 },
  { position: 13, points: 16 },
  { position: 14, points: 14 },
  { position: 15, points: 12 },
  { position: 16, points: 11 },
];

interface Player {
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

function PlayersManagement() {
  const { toast } = useToast();
  const [playerSearch, setPlayerSearch] = useState("");
  const { user } = useAuth();
  
  const { data: players = [], isLoading } = useQuery<Player[]>({
    queryKey: ['/api/players'],
  });
  
  const updateRoleMutation = useMutation({
    mutationFn: async ({ playerId, role }: { playerId: string; role: string }) => {
      const response = await apiRequest('PATCH', `/api/players/${playerId}/role`, { role, adminId: user?.id });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      toast({
        title: "Ruolo aggiornato",
        description: "Il ruolo dell'utente è stato modificato con successo",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il ruolo",
        variant: "destructive",
      });
    },
  });
  
  const filteredPlayers = players.filter(player => 
    !playerSearch || 
    player.firstName.toLowerCase().includes(playerSearch.toLowerCase()) ||
    player.lastName.toLowerCase().includes(playerSearch.toLowerCase()) ||
    player.email.toLowerCase().includes(playerSearch.toLowerCase())
  );
  
  const handleRoleChange = (playerId: string, newRole: string) => {
    updateRoleMutation.mutate({ playerId, role: newRole });
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Caricamento giocatori...
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Gestione Giocatori e Ruoli
        </CardTitle>
        <CardDescription>
          Visualizza tutti i giocatori e modifica i loro ruoli (player/admin)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome, cognome o email..."
            value={playerSearch}
            onChange={(e) => setPlayerSearch(e.target.value)}
            className="pl-10"
            data-testid="input-search-players"
          />
        </div>
        
        <div className="space-y-2">
          {filteredPlayers.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Nessun giocatore trovato</p>
          ) : (
            filteredPlayers.map((player) => (
              <div 
                key={player.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between py-3 px-4 border rounded-md gap-3"
                data-testid={`row-player-${player.id}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">{player.firstName} {player.lastName}</p>
                    <Badge variant="outline" className="text-xs">
                      {levelLabels[player.level as keyof typeof levelLabels] || player.level}
                    </Badge>
                    {player.role === "admin" && (
                      <Badge variant="default" className="text-xs">Admin</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{player.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={player.role}
                    onValueChange={(value) => handleRoleChange(player.id, value)}
                    disabled={updateRoleMutation.isPending}
                  >
                    <SelectTrigger className="w-32" data-testid={`select-role-${player.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="player">Player</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [search, setSearch] = useState("");
  const [clubSearch, setClubSearch] = useState("");
  const [scoringEntries, setScoringEntries] = useState<ScoringEntry[]>(defaultScoringEntries);
  const [participationPoints, setParticipationPoints] = useState(10);
  const [isScoringDirty, setIsScoringDirty] = useState(false);
  const { toast } = useToast();

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
            <TabsTrigger value="scoring" className="gap-2" data-testid="tab-admin-scoring">
              <Star className="h-4 w-4" />
              Punteggi
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2" data-testid="tab-admin-settings">
              <Settings className="h-4 w-4" />
              Impostazioni
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
            <PlayersManagement />
          </TabsContent>

          <TabsContent value="scoring" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Tabella Punteggi Default
                  </CardTitle>
                  <CardDescription className="mt-1.5">
                    Configura i punti base assegnati per ogni posizione finale nei tornei
                  </CardDescription>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={!isScoringDirty}
                    onClick={() => {
                      setScoringEntries(defaultScoringEntries);
                      setParticipationPoints(10);
                      setIsScoringDirty(false);
                    }}
                    data-testid="button-reset-scoring"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Ripristina
                  </Button>
                  <Button 
                    size="sm"
                    disabled={!isScoringDirty}
                    onClick={() => {
                      setIsScoringDirty(false);
                      toast({
                        title: "Punteggi salvati",
                        description: "La tabella punteggi è stata aggiornata con successo",
                      });
                    }}
                    data-testid="button-save-scoring"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salva
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                  {scoringEntries.map((entry) => (
                    <div key={entry.position} className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        {entry.position}° Posto
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        value={entry.points}
                        onChange={(e) => {
                          const newPoints = parseInt(e.target.value) || 0;
                          setScoringEntries(prev => 
                            prev.map(en => 
                              en.position === entry.position 
                                ? { ...en, points: newPoints } 
                                : en
                            )
                          );
                          setIsScoringDirty(true);
                        }}
                        className="text-center"
                        data-testid={`input-points-position-${entry.position}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="border-t pt-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                    <div className="space-y-1.5 w-full sm:w-auto">
                      <Label htmlFor="participation-points" className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        Punti Partecipazione
                      </Label>
                      <Input
                        id="participation-points"
                        type="number"
                        min={0}
                        value={participationPoints}
                        onChange={(e) => {
                          setParticipationPoints(parseInt(e.target.value) || 0);
                          setIsScoringDirty(true);
                        }}
                        className="w-full sm:w-32"
                        data-testid="input-participation-points"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground pb-2">
                      Punti assegnati ai giocatori classificati dal 17° posto in avanti
                    </p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium mb-3">Anteprima con Moltiplicatore Torneo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 1.5, 2].map((multiplier) => (
                      <Card key={multiplier} className="bg-muted/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center justify-between gap-2">
                            <span>Moltiplicatore x{multiplier}</span>
                            {multiplier === 1 && <Badge variant="secondary" className="text-xs">Base</Badge>}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">1° posto:</span>
                              <span className="font-medium">{Math.round(scoringEntries[0].points * multiplier)} pt</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">2° posto:</span>
                              <span className="font-medium">{Math.round(scoringEntries[1].points * multiplier)} pt</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">3° posto:</span>
                              <span className="font-medium">{Math.round(scoringEntries[2].points * multiplier)} pt</span>
                            </div>
                            <div className="flex justify-between border-t pt-1 mt-1">
                              <span className="text-muted-foreground">Partecipazione:</span>
                              <span className="font-medium">{Math.round(participationPoints * multiplier)} pt</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function SettingsPanel() {
  const { toast } = useToast();
  const [chainRollingWeeks, setChainRollingWeeks] = useState<string>("");
  const [clubSettings, setClubSettings] = useState<Record<number, string>>({});

  const { data: chainSettings } = useQuery<{ id: number; key: string; value: string; description: string | null }[]>({
    queryKey: ['/api/chain-settings'],
  });

  const { data: clubs } = useQuery<{ id: number; name: string; rollingWeeks: number | null }[]>({
    queryKey: ['/api/clubs'],
  });

  useEffect(() => {
    if (chainSettings) {
      const rollingWeeksSetting = chainSettings.find(s => s.key === 'rollingWeeks');
      if (rollingWeeksSetting) {
        setChainRollingWeeks(rollingWeeksSetting.value);
      }
    }
  }, [chainSettings]);

  useEffect(() => {
    if (clubs) {
      const settings: Record<number, string> = {};
      clubs.forEach(club => {
        settings[club.id] = club.rollingWeeks?.toString() || "";
      });
      setClubSettings(settings);
    }
  }, [clubs]);

  const updateChainSettingMutation = useMutation({
    mutationFn: async (data: { key: string; value: string }) => {
      return apiRequest('PUT', `/api/chain-settings/${data.key}`, { value: data.value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chain-settings'] });
      toast({
        title: "Impostazione salvata",
        description: "L'impostazione della catena è stata aggiornata",
      });
    },
  });

  const updateClubMutation = useMutation({
    mutationFn: async (data: { id: number; rollingWeeks: number | null }) => {
      return apiRequest('PATCH', `/api/clubs/${data.id}`, { rollingWeeks: data.rollingWeeks });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clubs'] });
      toast({
        title: "Club aggiornato",
        description: "Le impostazioni del club sono state aggiornate",
      });
    },
  });

  const handleSaveChainRollingWeeks = () => {
    updateChainSettingMutation.mutate({
      key: 'rollingWeeks',
      value: chainRollingWeeks || "0",
    });
  };

  const handleSaveClubRollingWeeks = (clubId: number) => {
    const weeks = clubSettings[clubId];
    updateClubMutation.mutate({
      id: clubId,
      rollingWeeks: weeks ? parseInt(weeks) : null,
    });
  };

  const rollingWeeksOptions = [
    { value: "", label: "Usa default catena" },
    { value: "4", label: "4 settimane" },
    { value: "8", label: "8 settimane" },
    { value: "12", label: "12 settimane" },
    { value: "16", label: "16 settimane" },
    { value: "24", label: "24 settimane" },
    { value: "52", label: "52 settimane (1 anno)" },
  ];

  const chainRollingWeeksOptions = [
    { value: "0", label: "Nessun limite" },
    { value: "4", label: "4 settimane" },
    { value: "8", label: "8 settimane" },
    { value: "12", label: "12 settimane" },
    { value: "16", label: "16 settimane" },
    { value: "24", label: "24 settimane" },
    { value: "52", label: "52 settimane (1 anno)" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Periodo Rolling Punti - Catena
          </CardTitle>
          <CardDescription>
            Imposta il numero di settimane da considerare per il calcolo delle classifiche a livello di catena.
            Questo valore è il default per tutti i club che non hanno un'impostazione specifica.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="space-y-2 w-full sm:w-64">
              <Label htmlFor="chain-rolling-weeks">Periodo Rolling (settimane)</Label>
              <Select
                value={chainRollingWeeks}
                onValueChange={setChainRollingWeeks}
              >
                <SelectTrigger id="chain-rolling-weeks" data-testid="select-chain-rolling-weeks">
                  <SelectValue placeholder="Seleziona periodo" />
                </SelectTrigger>
                <SelectContent>
                  {chainRollingWeeksOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleSaveChainRollingWeeks}
              disabled={updateChainSettingMutation.isPending}
              data-testid="button-save-chain-rolling-weeks"
            >
              <Save className="h-4 w-4 mr-2" />
              Salva
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Periodo Rolling Punti - Per Club
          </CardTitle>
          <CardDescription>
            Imposta un periodo rolling specifico per ogni club. Se non impostato, verrà utilizzato il valore della catena.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clubs?.map((club) => (
              <div 
                key={club.id} 
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-3 border-b last:border-0"
              >
                <div className="flex-1">
                  <p className="font-medium">{club.name}</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Select
                    value={clubSettings[club.id] || ""}
                    onValueChange={(value) => setClubSettings(prev => ({ ...prev, [club.id]: value }))}
                  >
                    <SelectTrigger className="w-48" data-testid={`select-club-rolling-weeks-${club.id}`}>
                      <SelectValue placeholder="Usa default catena" />
                    </SelectTrigger>
                    <SelectContent>
                      {rollingWeeksOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    size="sm"
                    onClick={() => handleSaveClubRollingWeeks(club.id)}
                    disabled={updateClubMutation.isPending}
                    data-testid={`button-save-club-rolling-weeks-${club.id}`}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
