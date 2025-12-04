import { PlayerCard } from '../PlayerCard';

// todo: remove mock functionality
const mockPlayer = {
  id: 1,
  firstName: "Marco",
  lastName: "Rossi",
  profileImageUrl: null,
  gender: 'male' as const,
  level: 'intermediate' as const,
  points: 1250,
  ranking: 3,
  matchesPlayed: 24,
  wins: 18,
};

export default function PlayerCardExample() {
  return (
    <div className="max-w-xs">
      <PlayerCard 
        player={mockPlayer}
        onViewProfile={(id) => console.log('View profile:', id)}
      />
    </div>
  );
}
