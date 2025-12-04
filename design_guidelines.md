# Design Guidelines: Padel Tournament Management Web App

## Design Approach

**Selected Approach:** Design System-Based with Sports Energy

Drawing from **Linear** for clean data displays and **Notion** for content organization, enhanced with athletic energy inspired by modern sports platforms like Strava. The design emphasizes clarity for rankings and tournament data while maintaining visual excitement appropriate for competitive sports.

## Core Design Elements

### Typography

**Font Families:**
- Primary: Inter (via Google Fonts CDN)
- Headings: Bold weights (700-800) for tournament names, player names
- Body: Regular/Medium (400-500) for stats, descriptions
- Data/Rankings: Tabular numbers for consistent alignment

**Hierarchy:**
- Page Titles: text-4xl md:text-5xl font-bold
- Section Headers: text-2xl md:text-3xl font-bold
- Card Titles: text-xl font-semibold
- Body Text: text-base
- Stats/Numbers: text-lg md:text-2xl font-bold (tabular)
- Metadata: text-sm text-gray-600

### Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 8, 16, 24
- Component padding: p-4 to p-8
- Section spacing: py-16 to py-24
- Card gaps: gap-4 to gap-8
- Element margins: m-2, m-4, m-8

**Containers:**
- max-w-7xl for main content
- max-w-4xl for focused content (tournament details)
- Full-width tables for rankings

**Grid Patterns:**
- Tournament cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Stats dashboard: grid-cols-2 lg:grid-cols-4
- Match results: Single column on mobile, 2-column on desktop

### Component Library

**Navigation:**
- Top navigation bar with logo, main links (Tornei, Classifiche, Profilo)
- Mobile: Hamburger menu with slide-out drawer
- Admin section clearly distinguished with badge/indicator
- Active state with underline indicator

**Hero Section:**
- Full-width banner with background image (padel court action shot)
- Centered content with welcome message and primary CTA ("Registrati" or "Crea Torneo")
- Blurred background button treatment for CTAs on hero
- Height: 60vh on mobile, 80vh on desktop

**Tournament Cards:**
- Rounded borders (rounded-xl)
- Tournament name, date, level badge, participant count
- Status indicator (Iscrizioni Aperte, In Corso, Concluso)
- Action button at bottom (Iscriviti/Vedi Dettagli)
- Hover: subtle elevation increase

**Rankings Table:**
- Clean, striped rows for readability
- Sticky header on scroll
- Columns: Position, Name, Points, Matches Played, Win Rate
- Top 3 positions visually distinguished with position badges
- Tabs for gender/level filters above table
- Mobile: Simplified card view instead of table

**Match Result Cards:**
- Player names with scores prominently displayed
- Date and match type (Torneo/Partita Singola)
- Compact layout for match history lists
- Expandable for additional details

**Tournament Bracket:**
- Tree structure for elimination rounds
- Responsive: horizontal scroll on mobile, full view on desktop
- Clear connection lines between matches
- Winner progression visually emphasized

**Forms:**
- Clean, spacious input fields (h-12)
- Clear labels above inputs
- Validation states with inline messages
- Primary action buttons prominent and full-width on mobile
- Secondary actions as text links

**Dashboard Widgets:**
- Admin dashboard: grid of quick stats (total players, active tournaments, recent matches)
- Player dashboard: personal stats, upcoming matches, recent results
- Card-based layout with consistent padding (p-6)

**Badges & Tags:**
- Level indicators: rounded-full px-3 py-1 text-sm
- Gender tags: subtle background differentiation
- Status badges: clear visual states (green for active, gray for completed)

**Modals/Overlays:**
- Center-aligned with backdrop blur
- Tournament creation form in modal
- Match result input modal
- Confirmation dialogs for admin actions

### Accessibility

- Minimum touch targets: 44px height for all interactive elements
- Form inputs: consistent h-12 with clear focus states
- Color-independent status indicators (use icons + text)
- ARIA labels for icon-only buttons
- Keyboard navigation support for brackets and tables

### Animations

Use sparingly:
- Smooth transitions for tabs switching (duration-200)
- Subtle hover effects on cards (transform scale-102)
- Loading states for data fetches (spinner)
- No scroll-triggered animations

## Images

**Hero Image:**
- Large hero image: Yes
- Content: Dynamic padel court action shot (players mid-game, showing energy and competition)
- Placement: Full-width hero section at top of homepage
- Treatment: Subtle overlay gradient for text readability

**Additional Images:**
- Tournament detail pages: Court image or tournament-specific photo
- Player profiles: Avatar/profile photo upload
- Empty states: Illustration for "no tournaments" or "no matches yet"

**Image Sources:**
- Use placeholder services (Unsplash API) for sports/padel imagery
- Maintain 16:9 aspect ratio for tournament images
- Profile avatars: square (1:1 ratio)

## Icons

**Library:** Heroicons (via CDN)
- Navigation: outline style
- Actions: solid style for primary actions
- Status indicators: mini icons for compact spaces
- Consistent 20px or 24px sizing

---

**Design Principle:** Create a professional, data-focused platform that celebrates competitive spirit through clean typography, strategic use of sports imagery, and clear information hierarchy. Prioritize quick access to rankings and tournament information while maintaining visual energy that motivates player engagement.