import { Trophy, Calendar, Users, Target, ChevronRight } from "lucide-react";
import { Hero } from "@/components/Hero";
import { TournamentCard, type Tournament } from "@/components/TournamentCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import logoUrl from "@assets/logo_1765462473044.jpg";

const upcomingTournaments: Tournament[] = [
  {
    id: 1,
    name: "Torneo Primavera 2024",
    date: new Date("2024-04-15"),
    location: "GonettaGO Milano",
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
    name: "Torneo Principianti",
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
];

const features = [
  {
    icon: Calendar,
    title: "Tornei Organizzati",
    description: "Iscriviti ai tornei e competi per scalare la classifica. Punti doppi o tripli in base al livello del torneo.",
  },
  {
    icon: Trophy,
    title: "Classifiche Dettagliate",
    description: "Classifiche separate per genere e livello di gioco: principianti, intermedi e avanzati.",
  },
  {
    icon: Users,
    title: "Partite Singole",
    description: "Registra le tue partite fuori dai tornei e accumula punti per la classifica.",
  },
  {
    icon: Target,
    title: "Statistiche Personali",
    description: "Monitora le tue prestazioni, vittorie, sconfitte e progressi nel tempo.",
  },
];

interface LandingProps {
  isAuthenticated?: boolean;
}

export default function Landing({ isAuthenticated = false }: LandingProps) {
  return (
    <div className="min-h-screen">
      <Hero isAuthenticated={isAuthenticated} />
      
      <section className="py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-features-title">
            Come Funziona
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover-elevate">
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8 gap-4">
            <h2 className="text-3xl font-bold" data-testid="text-tournaments-title">
              Prossimi Tornei
            </h2>
            {isAuthenticated && (
              <Link href="/tournaments">
                <Button variant="outline" className="gap-2" data-testid="button-all-tournaments">
                  Vedi Tutti
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingTournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                onRegister={(id) => console.log('Register for:', id)}
                onViewDetails={(id) => console.log('View details:', id)}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto a Competere?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Unisciti alla community di giocatori di padel e inizia a scalare la classifica.
          </p>
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="gap-2" data-testid="button-cta-register">
                  Registrati Gratuitamente
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="gap-2" data-testid="button-cta-login">
                  Accedi
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <footer className="border-t py-8 px-4">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="GonettaGO" className="h-8 w-auto" />
            <span className="font-bold">GonettaGO</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Gestione tornei e classifiche di padel
          </p>
        </div>
      </footer>
    </div>
  );
}
