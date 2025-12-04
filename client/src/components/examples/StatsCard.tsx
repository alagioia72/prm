import { Trophy, Users, Calendar, Target } from 'lucide-react';
import { StatsCard } from '../StatsCard';

export default function StatsCardExample() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard 
        title="Giocatori Totali"
        value={156}
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
        title="Partite Giocate"
        value={342}
        icon={Target}
        trend={{ value: 8, label: "questa settimana", positive: true }}
      />
      <StatsCard 
        title="Punti Totali"
        value="12.5K"
        icon={Trophy}
      />
    </div>
  );
}
