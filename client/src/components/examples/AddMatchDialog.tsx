import { AddMatchDialog } from '../AddMatchDialog';

// todo: remove mock functionality
const mockPlayers = [
  { id: 1, firstName: "Marco", lastName: "Rossi" },
  { id: 2, firstName: "Luca", lastName: "Bianchi" },
  { id: 3, firstName: "Andrea", lastName: "Verdi" },
  { id: 4, firstName: "Giuseppe", lastName: "Ferrari" },
  { id: 5, firstName: "Paolo", lastName: "Romano" },
  { id: 6, firstName: "Matteo", lastName: "Greco" },
];

export default function AddMatchDialogExample() {
  return (
    <AddMatchDialog 
      players={mockPlayers}
      onSubmit={(data) => console.log('Match submitted:', data)}
    />
  );
}
