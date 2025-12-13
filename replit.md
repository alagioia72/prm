# GonettaGO - Gestione Tornei e Classifiche Padel

## Overview
Web application per la gestione di tornei e partite di padel con sistema di classifiche divise per genere (maschile/femminile) e livello (principianti, intermedi, avanzati).

## Current State
**Fase**: MVP funzionante con autenticazione e gestione ruoli

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

### Backend (implementato)
- **Framework**: Express.js
- **Database**: PostgreSQL con Drizzle ORM (DatabaseStorage)
- **Auth**: Sistema custom con bcrypt + email verification

## Tech Stack
- Node.js 20
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components
- PostgreSQL (Drizzle ORM)
- Replit Auth

## User Roles
1. **Giocatore (player)**: Registrazione, iscrizione tornei, inserimento partite singole, consultazione classifiche
2. **Amministratore (admin)**: Tutte le funzionalità giocatore + creazione tornei, gestione utenti, modifica ruoli

### Sistema Ruoli
- Campo `role` nella tabella `players` con valori: "player" (default) o "admin"
- I nuovi utenti registrati sono sempre "player"
- Solo gli admin possono modificare i ruoli degli altri utenti
- **Admin di default**: admin@gonettago.it / Ranking123 (account fisso preconfigurato)
- API: PATCH /api/players/:id/role per cambiare ruolo
- UI: Dashboard Admin > Tab Giocatori per gestire i ruoli

## Scoring System
- **Profili punteggio configurabili**: Admin può definire punti per le prime 16 posizioni
- **Punti partecipazione**: Per giocatori oltre la 16° posizione
- **Moltiplicatori decimali**: Ogni torneo ha un moltiplicatore (0.1-10x) che moltiplica i punti base
- **Preview in tempo reale**: La tab Punteggi mostra anteprima dei punti con moltiplicatori x1, x1.5, x2
- **Default**: 1°=100pt, 2°=80pt, 3°=65pt, etc. Partecipazione=10pt
- **Periodo Rolling**: I punti vengono calcolati solo per partite/tornei entro un periodo configurabile in settimane

## Rolling Weeks Configuration
- **Configurazione a livello catena**: L'admin può impostare un periodo rolling default per tutta la catena
- **Configurazione a livello club**: Ogni club può avere un periodo rolling specifico che sovrascrive quello della catena
- **Opzioni disponibili**: 4, 8, 12, 16, 24, 52 settimane o nessun limite
- **API endpoint**: GET /api/rankings?gender=&level=&clubId= calcola i punti rispettando il periodo rolling
- **Gestione**: Dashboard Admin > Tab Impostazioni

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

## User Authentication
- **Registrazione**: POST /api/auth/register con validazione email, password hashata con bcrypt
- **Login**: POST /api/auth/login con verifica password e controllo email verificata
- **Verifica Email**: GET /api/auth/verify-email?token=xxx conferma email utente
- **Reinvio Verifica**: POST /api/auth/resend-verification per rinviare email di verifica
- **Password**: Cifrata con bcrypt (10 rounds), mai esposta nelle API
- **Session**: Salvata in localStorage (frontend), include role per determinare privilegi admin

## Email Notifications (SMTP)
- Email di verifica inviate alla registrazione
- Notifiche automatiche ai giocatori idonei quando viene creato un nuovo torneo
- Template HTML responsive con branding GonettaGO
- SMTP via smtp.gonetta.it:465 (Aruba, SSL/TLS)

## User Preferences
- **Import con estensione**: Usare sempre l'estensione `.ts` negli import TypeScript (es: `import { foo } from "./bar.ts"`)

## Recent Changes
- 2024-12-13: Fix iscrizione tornei da pagina Tournaments (aggiunto useAuth per passare currentPlayerId)
- 2024-12-12: Implementata funzionalità edit/delete per tornei (PATCH/DELETE /api/tournaments/:id)
- 2024-12-12: EditTournamentDialog per modifica tornei con tutti i campi
- 2024-12-12: TournamentCard mostra pulsanti edit/delete per admin
- 2024-12-12: deleteTournament elimina anche registrazioni e risultati collegati
- 2024-12-12: Implementata funzionalità edit/delete per club e giocatori
- 2024-12-12: EditClubDialog, EditPlayerDialog, DeleteConfirmDialog (riutilizzabile)
- 2024-12-12: API PATCH /api/clubs/:id, DELETE /api/clubs/:id
- 2024-12-12: API PATCH /api/players/:id, DELETE /api/players/:id
- 2024-12-12: Fix SelectItem value vuoto in EditPlayerDialog (usa "none" per nessuna sede)
- 2024-12-11: Rimosso tutto il mock data dal frontend - tutte le pagine ora usano dati reali dal database
- 2024-12-11: Fix sicurezza: API /api/players non espone più password/verificationToken
- 2024-12-11: Home, Tournaments, Rankings, MyMatches, Players, Profile usano useQuery per dati API
- 2024-12-11: Implementato sistema ruoli (player/admin) con campo role nella tabella players
- 2024-12-11: Account admin fisso preconfigurato: admin@gonettago.it / Ranking123
- 2024-12-11: UI gestione ruoli in Dashboard Admin > Tab Giocatori
- 2024-12-11: API PATCH /api/players/:id/role per modifica ruoli
- 2024-12-11: Rimossa tabella users inutilizzata dallo schema
- 2024-12-11: Rebranding da "Padel Club" a "GonettaGO" con nuovo logo
- 2024-12-11: Implementato sistema periodo rolling per calcolo classifiche (configurabile per catena e per club)
- 2024-12-11: Tab "Impostazioni" in admin dashboard per configurare rolling weeks
- 2024-12-11: API /api/rankings con supporto per filtro periodo rolling
- 2024-12-11: API PATCH /api/clubs/:id per aggiornare rolling weeks del club
- 2024-12-11: API /api/chain-settings per gestione impostazioni a livello catena
- 2024-12-09: Implementato sistema registrazione utenti con password cifrata bcrypt
- 2024-12-09: Aggiunta verifica email con token e reinvio verifica
- 2024-12-09: Integrato Resend per invio email transazionali
- 2024-12-09: Notifiche email automatiche ai giocatori idonei alla creazione torneo
- 2024-12-09: Pagine Register, Login, VerifyEmail nel frontend
- 2024-12-09: AuthProvider context per gestione stato autenticazione
- 2024-12-09: Navbar aggiornata con login/logout funzionanti
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

## Next Steps
1. Aggiungere più test e-2-e per validare flussi utente
2. Implementare notifiche push per tornei
3. Aggiungere statistiche avanzate giocatore
4. Dashboard analytics per admin
