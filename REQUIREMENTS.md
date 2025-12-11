# Padel Club - Requisiti per Deployment Esterno

## Requisiti di Sistema

### Runtime
- **Node.js**: v20.x o superiore
- **npm**: v10.x o superiore

### Database
- **PostgreSQL**: v14 o superiore

## Variabili d'Ambiente Richieste

Crea un file `.env` nella root del progetto con le seguenti variabili:

```env
# Database PostgreSQL
DATABASE_URL=postgresql://username:password@host:port/database

# Variabili PostgreSQL singole (alternative a DATABASE_URL)
PGHOST=localhost
PGPORT=5432
PGUSER=your_username
PGPASSWORD=your_password
PGDATABASE=padelclub

# Sessioni
SESSION_SECRET=una_stringa_segreta_molto_lunga_e_casuale

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxx

# URL dell'applicazione (per link nelle email)
APP_URL=https://tuodominio.com
```

## Dipendenze Node.js

Le dipendenze sono definite in `package.json`. Le principali sono:

### Produzione
| Pacchetto | Versione | Descrizione |
|-----------|----------|-------------|
| express | ^4.21.2 | Server HTTP |
| pg | ^8.16.3 | Driver PostgreSQL |
| drizzle-orm | ^0.39.3 | ORM per database |
| bcryptjs | ^3.0.3 | Hashing password |
| express-session | ^1.18.1 | Gestione sessioni |
| resend | ^4.0.0 | Invio email |
| zod | ^3.24.2 | Validazione dati |
| react | ^18.3.1 | Frontend |
| wouter | ^3.3.5 | Routing frontend |
| @tanstack/react-query | ^5.60.5 | Data fetching |

### Sviluppo
| Pacchetto | Versione | Descrizione |
|-----------|----------|-------------|
| typescript | 5.6.3 | Compilatore TypeScript |
| vite | ^5.4.20 | Build tool frontend |
| tsx | ^4.20.5 | Esecuzione TypeScript |
| drizzle-kit | ^0.31.4 | Migrazioni database |
| tailwindcss | ^3.4.17 | Framework CSS |

## Installazione

```bash
# 1. Clona il repository
git clone <repository-url>
cd padel-club

# 2. Installa le dipendenze
npm install

# 3. Configura le variabili d'ambiente
cp .env.example .env
# Modifica .env con i tuoi valori

# 4. Inizializza il database
npm run db:push

# 5. Avvia in sviluppo
npm run dev

# 6. Oppure build per produzione
npm run build
npm run start
```

## Script Disponibili

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Avvia server di sviluppo (hot reload) |
| `npm run build` | Compila per produzione |
| `npm run start` | Avvia server di produzione |
| `npm run check` | Verifica tipi TypeScript |
| `npm run db:push` | Sincronizza schema database |

## Porte

- **Porta applicazione**: 5000 (configurabile)
- L'applicazione serve sia frontend che backend sulla stessa porta

## Struttura Progetto

```
├── client/                 # Frontend React
│   └── src/
│       ├── components/     # Componenti UI
│       ├── pages/          # Pagine applicazione
│       ├── hooks/          # Custom hooks (auth, etc.)
│       └── lib/            # Utilità
├── server/                 # Backend Express
│   ├── index.ts            # Entry point
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Interfaccia database
│   └── email.ts            # Servizio email
├── shared/                 # Codice condiviso
│   └── schema.ts           # Schema database Drizzle
├── package.json
├── tsconfig.json
├── vite.config.ts
└── drizzle.config.ts
```

## Configurazione Database

Lo schema è definito in `shared/schema.ts` usando Drizzle ORM. Tabelle principali:

- `users` - Utenti e autenticazione
- `players` - Profili giocatori
- `tournaments` - Tornei
- `tournament_registrations` - Iscrizioni tornei
- `matches` - Partite libere
- `scoring_profiles` - Profili punteggio
- `clubs` - Sedi/Club

## Servizi Esterni Richiesti

### Resend (Email)
1. Registrati su [resend.com](https://resend.com)
2. Crea un API key
3. Verifica il dominio per invio email
4. Configura `RESEND_API_KEY` nel `.env`

## Sicurezza

- Password hashate con bcrypt (10 rounds)
- Sessioni con cookie sicuro in produzione
- Validazione input con Zod
- CORS configurato per stesso dominio

## Note per Produzione

1. Imposta `NODE_ENV=production`
2. Usa HTTPS (configura reverse proxy come nginx)
3. Configura cookie sicuri per le sessioni
4. Verifica che `SESSION_SECRET` sia una stringa lunga e casuale
5. Configura backup database PostgreSQL
6. Considera rate limiting per API

## Troubleshooting

### Errore connessione database
- Verifica che PostgreSQL sia in esecuzione
- Controlla le credenziali in `DATABASE_URL`
- Assicurati che il database esista

### Email non inviate
- Verifica `RESEND_API_KEY`
- Controlla che il dominio sia verificato su Resend
- In sviluppo le email potrebbero andare in spam

### Build fallita
- Esegui `npm run check` per errori TypeScript
- Verifica tutte le dipendenze installate
