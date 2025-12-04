import { TournamentCard, type Tournament } from '../TournamentCard';

// todo: remove mock functionality
const mockTournament: Tournament = {
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
};

export default function TournamentCardExample() {
  return (
    <div className="max-w-sm">
      <TournamentCard 
        tournament={mockTournament}
        onRegister={(id) => console.log('Register for tournament:', id)}
        onViewDetails={(id) => console.log('View details:', id)}
      />
    </div>
  );
}
