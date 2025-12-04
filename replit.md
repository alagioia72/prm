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
- Partite singole: Punti base
- Tornei: Punti moltiplicati (x2, x3, x5) in base al livello torneo

## Recent Changes
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
