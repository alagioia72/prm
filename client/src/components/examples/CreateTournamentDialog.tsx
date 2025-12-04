import { CreateTournamentDialog } from '../CreateTournamentDialog';

export default function CreateTournamentDialogExample() {
  return (
    <CreateTournamentDialog 
      onSubmit={(data) => console.log('Tournament created:', data)}
    />
  );
}
