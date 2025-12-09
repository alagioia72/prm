import { Button } from "@/components/ui/button";
import { Trophy, Calendar } from "lucide-react";
import { Link } from "wouter";
import heroImage from "@assets/stock_images/padel_tennis_court_a_87436f1f.jpg";

interface HeroProps {
  isAuthenticated: boolean;
}

export function Hero({ isAuthenticated }: HeroProps) {
  return (
    <section className="relative min-h-[60vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
      
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6" data-testid="text-hero-title">
          Gestisci Tornei e Partite di Padel
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto" data-testid="text-hero-subtitle">
          Iscriviti ai tornei, registra le tue partite e scala la classifica. 
          Classifiche divise per genere e livello di gioco.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isAuthenticated ? (
            <>
              <Link href="/tournaments">
                <Button size="lg" className="w-full sm:w-auto gap-2" data-testid="button-hero-tournaments">
                  <Calendar className="h-5 w-5" />
                  Vedi Tornei
                </Button>
              </Link>
              <Link href="/rankings">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 bg-white/10 backdrop-blur border-white/20 text-white" data-testid="button-hero-rankings">
                  <Trophy className="h-5 w-5" />
                  Classifiche
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto gap-2" data-testid="button-hero-register">
                  Registrati Ora
                </Button>
              </Link>
              <Link href="/rankings">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 bg-white/10 backdrop-blur border-white/20 text-white" data-testid="button-hero-view-rankings">
                  <Trophy className="h-5 w-5" />
                  Vedi Classifiche
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
