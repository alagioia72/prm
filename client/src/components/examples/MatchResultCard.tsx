import { MatchResultCard, type MatchResult } from '../MatchResultCard';

// todo: remove mock functionality
const mockMatch: MatchResult = {
  id: 1,
  date: new Date("2024-03-20"),
  type: 'tournament',
  tournamentName: 'Torneo Primavera 2024',
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
};

export default function MatchResultCardExample() {
  return (
    <div className="max-w-2xl">
      <MatchResultCard match={mockMatch} highlightPlayerId={1} />
    </div>
  );
}
