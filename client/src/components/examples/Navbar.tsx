import { Navbar } from '../Navbar';

// todo: remove mock functionality
const mockUser = {
  firstName: "Marco",
  lastName: "Rossi",
  profileImageUrl: null,
  role: 'admin' as const,
};

export default function NavbarExample() {
  return <Navbar user={mockUser} isAuthenticated={true} />;
}
