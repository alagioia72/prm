# Padel Club - Gestione Tornei e Classifiche

## Overview
Web application per la gestione di tornei e partite di padel con sistema di classifiche divise per genere (maschile/femminile) e livello (principianti, intermedi, avanzati).

## Current State
**Fase**: Prototipo Frontend completato (in attesa di feedback utente)

Il prototipo include:
- Landing page con hero section
- Dashboard giocatore autenticato
- Pagina tornei con filtri e creazione
- Classifiche con tab per genere/livello
- Elenco giocatori con filtri
- Profilo utente modificabile
- Dashboard amministratore
- Storico partite personali
- Dialog per registrazione partite
- Dialog per creazione tornei
- Tema chiaro/scuro

## Tipi di Torneo
- **Iscrizione a Coppia**: Giocatori si iscrivono in coppia
- **Iscrizione Individuale**: Giocatori si iscrivono singolarmente (sempre round-robin)

## Formati Torneo
- **Tabellone (Bracket)**: Eliminazione diretta con fasi
- **Tutti contro tutti (Round-Robin)**: Ogni partecipante gioca contro tutti
  - Nei round-robin l'admin definisce l'ordine finale e assegna punti

## Project Architecture

### Frontend (client/)
- **Framework**: React + TypeScript
- **Routing**: Wouter
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query
- **Icons**: Lucide React

### Components
- `Navbar` - Navigazione principale con menu mobile
- `Hero` - Sezione hero landing page
- `TournamentCard` - Card torneo con dettagli e azioni
- `RankingsTable` - Tabella classifiche con filtri
- `MatchResultCard` - Card risultato partita
- `PlayerCard` - Card profilo giocatore
- `StatsCard` - Card statistiche
- `AddMatchDialog` - Dialog registrazione partita
- `CreateTournamentDialog` - Dialog creazione torneo
- `ThemeToggle` - Switch tema chiaro/scuro

### Pages
- `/` - Landing (non auth) / Home (auth)
- `/tournaments` - Lista tornei
- `/rankings` - Classifiche
- `/players` - Elenco giocatori
- `/profile` - Profilo personale
- `/my-matches` - Storico partite
- `/admin` - Dashboard admin

### Backend (da implementare)
- **Framework**: Express.js
- **Database**: PostgreSQL con Drizzle ORM
- **Auth**: Replit Auth (OpenID Connect)

## Tech Stack
- Node.js 20
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components
- PostgreSQL (Drizzle ORM)
- Replit Auth

## User Roles
1. **Giocatore**: Registrazione, iscrizione tornei, inserimento partite singole, consultazione classifiche
2. **Amministratore**: Tutte le funzionalità giocatore + creazione tornei, gestione utenti

## Scoring System
- **Profili punteggio configurabili**: Admin può definire punti per le prime 16 posizioni
- **Punti partecipazione**: Per giocatori oltre la 16° posizione
- **Moltiplicatori decimali**: Ogni torneo ha un moltiplicatore (0.1-10x) che moltiplica i punti base
- **Preview in tempo reale**: La tab Punteggi mostra anteprima dei punti con moltiplicatori x1, x1.5, x2
- **Default**: 1°=100pt, 2°=80pt, 3°=65pt, etc. Partecipazione=10pt

## Partite Libere (Free Matches)
- I giocatori possono registrare partite giocate fuori dai tornei
- Punti calcolati automaticamente in base al numero di set:
  - **2 set**: 1/5 dei punti del 1° classificato (100/5 = 20 pt)
  - **3 set**: 1/6 dei punti del 1° classificato (100/6 ≈ 17 pt)
- La pagina "Le Mie Partite" mostra lo storico completo
- Ogni partita mostra data, squadre, punteggi e punti assegnati

## Gestione Multi-Sede
- **Catena di club**: Il sistema supporta più sedi/club nella stessa catena
- **Gestione sedi**: Solo gli amministratori possono creare/modificare sedi
- **Affiliazione giocatore**: Ogni giocatore appartiene a un solo club
- **Partecipazione tornei**: Giocatori possono partecipare ai tornei di tutte le sedi
- **Classifiche doppie**: 
  - Globale: tutti i giocatori di tutte le sedi
  - Locale: solo i giocatori di una specifica sede

## Recent Changes
- 2024-12-09: Aggiunta tabella players con gender e level per gestione giocatori
- 2024-12-09: Validazione eligibilità giocatori: genere e livello devono corrispondere al torneo
- 2024-12-09: TournamentDetailsDialog mostra lista iscritti con nomi giocatori reali
- 2024-12-09: TournamentRegistrationDialog usa API players reali e mostra errori eligibilità
- 2024-12-09: API /api/players per gestione giocatori (GET all, GET by id)
- 2024-12-09: API /api/tournaments/:id/registrations?withPlayers=true per dettagli iscritti
- 2024-12-09: Implementato sistema iscrizione tornei completo (schema, storage, API, UI)
- 2024-12-09: TournamentRegistrationDialog per iscrizione a tornei (coppia/individuale)
- 2024-12-09: API endpoints per registrazioni CRUD (GET/POST/DELETE /api/tournaments/:id/register)
- 2024-12-08: Implementato sistema assegnazione classifica tornei da parte degli amministratori
- 2024-12-08: TournamentDetailsDialog mostra classifica finale con nomi giocatori e punti
- 2024-12-08: Admin può modificare classifica in qualsiasi momento dai dettagli torneo
- 2024-12-08: Punti calcolati automaticamente (punti base × moltiplicatore torneo)
- 2024-12-08: Implementato sistema partite libere (matches table + CRUD API)
- 2024-12-08: Dialog registrazione partita con calcolo punti automatico (1/5 per 2 set, 1/6 per 3 set)
- 2024-12-08: Pagina "Le Mie Partite" connessa al backend per visualizzazione partite reali
- 2024-12-06: Aggiunto sistema punteggi configurabile con profili, 16 posizioni + punti partecipazione
- 2024-12-06: Tab "Punteggi" in admin dashboard con tabella editabile e preview moltiplicatori
- 2024-12-06: Moltiplicatore torneo con supporto decimali (0.1-10x, step 0.1)
- 2024-12-06: Aggiunta gestione multi-sede (club chain) con classifiche globali/locali
- 2024-12-04: Aggiunto supporto per tipi di iscrizione (coppia/individuale) e formati (tabellone/round-robin)
- 2024-12-04: Creato prototipo frontend completo con tutti i componenti e pagine
- 2024-12-04: Configurato tema con colori verdi (primary) per l'app sportiva
- 2024-12-04: Aggiunta immagine hero per landing page

## Next Steps (Backend)
1. Implementare schema database (users, tournaments, matches, registrations)
2. Configurare Replit Auth
3. Creare API routes per CRUD operazioni
4. Implementare logica calcolo punteggi
5. Collegare frontend al backend
