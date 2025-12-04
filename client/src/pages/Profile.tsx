import { useState } from "react";
import { User, Trophy, Calendar, Target, TrendingUp, Edit, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatsCard } from "@/components/StatsCard";
import { MatchResultCard, type MatchResult } from "@/components/MatchResultCard";

interface ProfileProps {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    profileImageUrl: string | null;
  };
}

// todo: remove mock functionality
const mockMatches: MatchResult[] = [
  {
    id: 1,
    date: new Date("2024-03-20"),
    type: 'tournament',
    tournamentName: 'Torneo Inverno',
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
  },
  {
    id: 2,
    date: new Date("2024-03-15"),
    type: 'single',
    team1: [
      { id: 1, firstName: "Marco", lastName: "Rossi", profileImageUrl: null },
      { id: 5, firstName: "Paolo", lastName: "Romano", profileImageUrl: null },
    ],
    team2: [
      { id: 6, firstName: "Matteo", lastName: "Greco", profileImageUrl: null },
      { id: 7, firstName: "Simone", lastName: "Marino", profileImageUrl: null },
    ],
    score1: [4, 6, 4],
    score2: [6, 3, 6],
    winningSide: 2,
    pointsAwarded: 25,
  },
];

export default function Profile({ user }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return "U";
  };

  const handleSave = () => {
    console.log('Saving profile:', { gender, level });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <User className="h-8 w-8 text-primary" />
            Il Mio Profilo
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={user.profileImageUrl || undefined} className="object-cover" />
                    <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold" data-testid="text-user-name">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-muted-foreground text-sm">{user.email}</p>
                  <div className="flex gap-2 mt-3">
                    <Badge variant="outline">{gender === 'male' ? 'Maschile' : 'Femminile'}</Badge>
                    <Badge variant="outline">
                      {level === 'beginner' ? 'Principiante' : level === 'intermediate' ? 'Intermedio' : 'Avanzato'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle>Informazioni</CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  data-testid={isEditing ? "button-save-profile" : "button-edit-profile"}
                >
                  {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={gender} onValueChange={(v) => setGender(v as 'male' | 'female')} disabled={!isEditing}>
                    <SelectTrigger data-testid="select-profile-gender">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Maschile</SelectItem>
                      <SelectItem value="female">Femminile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Livello</Label>
                  <Select value={level} onValueChange={(v) => setLevel(v as 'beginner' | 'intermediate' | 'advanced')} disabled={!isEditing}>
                    <SelectTrigger data-testid="select-profile-level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Principiante</SelectItem>
                      <SelectItem value="intermediate">Intermedio</SelectItem>
                      <SelectItem value="advanced">Avanzato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard 
                title="Posizione"
                value="#12"
                icon={Trophy}
              />
              <StatsCard 
                title="Punti"
                value={850}
                icon={Target}
              />
              <StatsCard 
                title="Partite"
                value={24}
                icon={Calendar}
              />
              <StatsCard 
                title="Win Rate"
                value="75%"
                icon={TrendingUp}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Ultime Partite</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockMatches.map((match) => (
                  <MatchResultCard 
                    key={match.id} 
                    match={match}
                    highlightPlayerId={1}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
