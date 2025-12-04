import { useState } from "react";
import { Trophy } from "lucide-react";
import { RankingsTable, type RankedPlayer } from "@/components/RankingsTable";

// todo: remove mock functionality
const mockMalePlayers: RankedPlayer[] = [
  { id: 1, position: 1, previousPosition: 2, firstName: "Marco", lastName: "Rossi", profileImageUrl: null, points: 1250, matchesPlayed: 24, wins: 18, losses: 6 },
  { id: 2, position: 2, previousPosition: 1, firstName: "Luca", lastName: "Bianchi", profileImageUrl: null, points: 1180, matchesPlayed: 22, wins: 16, losses: 6 },
  { id: 3, position: 3, previousPosition: 3, firstName: "Andrea", lastName: "Verdi", profileImageUrl: null, points: 1050, matchesPlayed: 20, wins: 14, losses: 6 },
  { id: 4, position: 4, previousPosition: 6, firstName: "Giuseppe", lastName: "Ferrari", profileImageUrl: null, points: 980, matchesPlayed: 18, wins: 12, losses: 6 },
  { id: 5, position: 5, previousPosition: null, firstName: "Paolo", lastName: "Romano", profileImageUrl: null, points: 920, matchesPlayed: 15, wins: 10, losses: 5 },
  { id: 6, position: 6, previousPosition: 4, firstName: "Matteo", lastName: "Greco", profileImageUrl: null, points: 890, matchesPlayed: 16, wins: 10, losses: 6 },
  { id: 7, position: 7, previousPosition: 8, firstName: "Simone", lastName: "Marino", profileImageUrl: null, points: 820, matchesPlayed: 14, wins: 9, losses: 5 },
  { id: 8, position: 8, previousPosition: 5, firstName: "Francesco", lastName: "Costa", profileImageUrl: null, points: 780, matchesPlayed: 18, wins: 9, losses: 9 },
  { id: 9, position: 9, previousPosition: 9, firstName: "Alessandro", lastName: "Bruno", profileImageUrl: null, points: 720, matchesPlayed: 12, wins: 7, losses: 5 },
  { id: 10, position: 10, previousPosition: 11, firstName: "Davide", lastName: "Ricci", profileImageUrl: null, points: 680, matchesPlayed: 14, wins: 7, losses: 7 },
];

const mockFemalePlayers: RankedPlayer[] = [
  { id: 11, position: 1, previousPosition: 1, firstName: "Giulia", lastName: "Martini", profileImageUrl: null, points: 1150, matchesPlayed: 20, wins: 16, losses: 4 },
  { id: 12, position: 2, previousPosition: 3, firstName: "Chiara", lastName: "Conti", profileImageUrl: null, points: 1080, matchesPlayed: 18, wins: 14, losses: 4 },
  { id: 13, position: 3, previousPosition: 2, firstName: "Sara", lastName: "Esposito", profileImageUrl: null, points: 1020, matchesPlayed: 19, wins: 13, losses: 6 },
  { id: 14, position: 4, previousPosition: null, firstName: "Elena", lastName: "Moretti", profileImageUrl: null, points: 950, matchesPlayed: 15, wins: 11, losses: 4 },
  { id: 15, position: 5, previousPosition: 4, firstName: "Valentina", lastName: "Barbieri", profileImageUrl: null, points: 890, matchesPlayed: 16, wins: 10, losses: 6 },
];

export default function Rankings() {
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

  const players = gender === 'male' ? mockMalePlayers : mockFemalePlayers;

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

        <RankingsTable
          players={players}
          gender={gender}
          level={level}
          onGenderChange={setGender}
          onLevelChange={setLevel}
        />
      </div>
    </div>
  );
}
