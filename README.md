# SCIM Viewer

Web app per amministrare utenti e gruppi tramite SCIM API di più applicazioni, su più
ambienti (dev/pre/prod), autenticandosi verso l'Identity Provider con OpenID Connect
**client-credentials** flow.

## Architettura

Poiché il client secret non può essere gestito in sicurezza in un frontend puro
(sarebbe visibile a chiunque apra il browser), l'app è composta da due parti:

- **`backend/`** — Node.js + TypeScript + Express. Espone API REST che:
  - gestiscono l'anagrafica di Ambienti, Applicazioni e delle Configurazioni
    applicazione+ambiente (client id, client secret, SCIM base URL), salvate in un
    database **SQLite** locale (`backend/data/scim-viewer.db`);
  - ottengono il token OAuth2 client-credentials dal Token Endpoint dell'ambiente
    selezionato (con cache in memoria fino a scadenza) e lo usano per proxare le
    chiamate SCIM (Users/Groups) verso l'applicazione selezionata.
- **`frontend/`** — React + TypeScript + Vite (SPA). Parla solo con il backend
  (mai direttamente con l'IdP o con le SCIM API) e permette di:
  - gestire l'anagrafica **Ambienti** (nome, Token Endpoint OIDC, scope di default);
  - gestire l'anagrafica **Applicazioni** e, per ognuna, le configurazioni per
    ambiente (client id, client secret, SCIM base URL, scope opzionale);
  - selezionare **Ambiente + Applicazione** attivi e da lì visualizzare/creare/eliminare
    **utenti** e **gruppi**, e aggiungere/rimuovere utenti dai gruppi.

> Nota: per decisione esplicita, i client secret sono salvati **in chiaro** nel
> database SQLite e l'app non ha un proprio login: è pensata per uso interno/locale
> su una macchina/rete fidata.

## Modello dati

- `environments`: `name`, `tokenEndpoint`, `scope` (default per l'ambiente)
- `applications`: `name`, `description`
- `app_environment_configs` (per coppia applicazione+ambiente): `clientId`,
  `clientSecret`, `scimBaseUrl`, `scope` (opzionale, sovrascrive quello dell'ambiente)

## Requisiti

- Node.js 18+ (verificato con Node 20)

## Avvio in sviluppo

Backend (porta 4000):

```powershell
cd backend
npm install
npm run dev
```

Frontend (porta 5173, con proxy verso il backend per le chiamate `/api`):

```powershell
cd frontend
npm install
npm run dev
```

Apri quindi `http://localhost:5173`.

## Build di produzione

```powershell
cd backend
npm run build
npm start        # avvia dist/server.js su http://localhost:4000

cd ../frontend
npm run build     # genera frontend/dist, da servire con un web server statico
                   # a scelta (proxando /api verso il backend)
```

## Utilizzo

1. Vai su **Ambienti** e crea almeno un ambiente (es. `dev`) indicando il Token
   Endpoint OIDC del relativo Identity Provider (e, opzionalmente, uno scope di
   default).
2. Vai su **Applicazioni**, crea un'applicazione e, tramite "Configurazioni per
   ambiente", aggiungi per ogni ambiente in cui l'applicazione è raggiungibile il
   client id, il client secret e la SCIM base URL da usare.
3. Nella pagina **Utenti & Gruppi**, seleziona in alto l'ambiente e l'applicazione
   con cui vuoi operare: potrai visualizzare, creare ed eliminare utenti e gruppi, e
   gestire l'appartenenza degli utenti ai gruppi.

Eventuali errori di autenticazione OIDC (es. token endpoint non raggiungibile,
client id/secret errati) o di chiamata alle SCIM API vengono mostrati come notifiche
(toast) con il dettaglio restituito dall'IdP o dalle API.

## Struttura del progetto

```
scim-viewer/
  backend/
    src/
      db/            # schema SQLite + repository (environments, applications, configs)
      routes/         # route Express (environments, applications, scim)
      services/       # tokenService (OIDC client-credentials) e scimClient (proxy SCIM)
      app.ts, server.ts
  frontend/
    src/
      api/            # client REST verso il backend
      components/     # Layout, selettore Ambiente/Applicazione, toast/notifiche
      pages/          # Anagrafica Ambienti, Anagrafica Applicazioni, Utenti & Gruppi
      App.tsx, main.tsx
```
