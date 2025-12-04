import { useState } from 'react';
import { RankingsTable, type RankedPlayer } from '../RankingsTable';

// todo: remove mock functionality
const mockPlayers: RankedPlayer[] = [
  { id: 1, position: 1, previousPosition: 2, firstName: "Marco", lastName: "Rossi", profileImageUrl: null, points: 1250, matchesPlayed: 24, wins: 18, losses: 6 },
  { id: 2, position: 2, previousPosition: 1, firstName: "Luca", lastName: "Bianchi", profileImageUrl: null, points: 1180, matchesPlayed: 22, wins: 16, losses: 6 },
  { id: 3, position: 3, previousPosition: 3, firstName: "Andrea", lastName: "Verdi", profileImageUrl: null, points: 1050, matchesPlayed: 20, wins: 14, losses: 6 },
  { id: 4, position: 4, previousPosition: 6, firstName: "Giuseppe", lastName: "Ferrari", profileImageUrl: null, points: 980, matchesPlayed: 18, wins: 12, losses: 6 },
  { id: 5, position: 5, previousPosition: null, firstName: "Paolo", lastName: "Romano", profileImageUrl: null, points: 920, matchesPlayed: 15, wins: 10, losses: 5 },
];

export default function RankingsTableExample() {
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

  return (
    <RankingsTable 
      players={mockPlayers}
      gender={gender}
      level={level}
      onGenderChange={setGender}
      onLevelChange={setLevel}
    />
  );
}
