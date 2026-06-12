# SManetting 🎼

Web app **in italiano** per **imparare a leggere gli spartiti musicali** partendo da
zero. Tre sezioni — **Teoria**, **Pratica**, **Componi** — con una dashboard dei
progressi. Funziona offline (PWA) e salva tutto in locale, senza alcun backend.

> Pianificazione e cronologia di sviluppo: [REQUISITI.md](REQUISITI.md) e
> [ROADMAP.md](ROADMAP.md).

## Funzionalità

- **Home / Dashboard** — progressi della Teoria, statistiche della Pratica e ultime
  composizioni salvate.
- **Teoria** — 10 moduli progressivi con spiegazioni, **esempi sul pentagramma
  cliccabili** (si ascoltano) e un mini‑quiz finale; superarlo (≥ 80%) sblocca la
  lezione successiva.
- **Pratica** — 5 esercizi interattivi con punteggio, streak e statistiche salvate:
  Riconosci la nota (4 livelli, nomi o tastiera, modalità a tempo), Valori e pause,
  Allenamento ritmico (metronomo + tap), Quiz armature, Dettato melodico.
- **Componi** — editor di spartiti: inserimento note per clic (con anteprima),
  durate/pause/alterazioni/punto, validazione delle battute, selezione e spostamento
  via drag, **undo/redo**, scorciatoie da tastiera, playback con cursore, salvataggio,
  **export MusicXML** e stampa/PDF.
- **Impostazioni** — lingua (IT/EN), tema chiaro/scuro, notazione anglosassone in
  aggiunta (Do = C), volume.

## Stack

- **React + Vite + TypeScript** (strict)
- **Tailwind CSS** (tema chiaro/scuro via variabili CSS)
- **React Router** con **code‑splitting** (le rotte musicali caricano VexFlow/Tone
  on‑demand)
- **VexFlow 5** per la notazione, **Tone.js 15** per l'audio — usati **solo** dentro
  `components/music/Staff` + `core/editorRenderer` e `audio/audio.ts`
- **Zustand** (+ `persist` su `localStorage`) per lo stato
- **react-i18next** (italiano predefinito, interfaccia bilingue IT/EN)
- **PWA** installabile e offline (`vite-plugin-pwa`)
- **Vitest** per i test della logica musicale

## Requisiti

- **Node.js ≥ 18** e **npm**

## Avvio

```bash
npm install
npm run dev        # http://localhost:5173
```

## Script

| Comando | Descrizione |
|---|---|
| `npm run dev` | Server di sviluppo con HMR |
| `npm run build` | Type-check + build di produzione in `dist/` |
| `npm run preview` | Anteprima locale della build |
| `npm run test` | Test (Vitest) |
| `npm run lint` / `npm run format` | ESLint / Prettier |

## Struttura

```
src/
├─ core/         # logica musicale pura e testata: modello, durate, pitch, teoria,
│                #   validazione, editorRenderer, staffGeometry, scoreEdit, musicxml
├─ audio/        # audio.ts — unico wrapper di Tone.js
├─ components/   # music/<Staff>, ui/ (Button, Card, Modal, Toast…), exercises/, quiz/
├─ data/         # contenuti: moduli/lezioni (Teoria), esercizi (Pratica)
├─ state/        # store Zustand: settings, progress, stats, compositions
├─ pages/        # Home, teoria/, pratica/, componi/, Impostazioni
└─ i18n/         # traduzioni it / en
```

> **Principio architetturale**: il **modello dati** in `core/` è l'unica fonte di
> verità; lo stesso `Score` alimenta rendering (VexFlow), audio (Tone.js) ed export
> MusicXML. Nessuna pagina importa VexFlow o Tone.js direttamente.

## PWA / offline

L'app è installabile e funziona offline: il service worker (precache + fallback SPA su
`index.html`) serve l'app e gli asset; progressi e composizioni restano in
`localStorage`. L'audio parte solo dopo un'interazione dell'utente (vincolo
`AudioContext` dei browser).

## Lingua

L'**interfaccia** è completamente bilingue (IT/EN). I **contenuti delle lezioni di
Teoria** sono in italiano (italiano‑first, come da requisiti); l'inglese è predisposto
per ampliarli.

## Deploy

Build statica (`npm run build` → `dist/`). Configurazioni di fallback SPA incluse.

### GitHub Pages (automatico)

È incluso un workflow GitHub Actions ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml))
che pubblica su GitHub Pages a ogni push su `master`/`main`:

1. Crea il repository su GitHub e fai push (assicurati che `package-lock.json` sia
   committato — serve a `npm ci`).
2. Su GitHub: **Settings → Pages → Source: GitHub Actions**.
3. Il workflow esegue test, builda con `base` = nome del repo, genera il fallback
   `404.html` e pubblica. L'app sarà su `https://<utente>.github.io/<repo>/`.

Il `base` è ricavato automaticamente dal nome del repository; il router usa
`import.meta.env.BASE_URL` come `basename`, quindi non c'è nulla da modificare a mano.
Per un build GitHub Pages in locale: `npm run build -- --base=/<nome-repo>/`.

### Vercel / Netlify

- **Vercel** — `vercel.json` (zero config).
- **Netlify** — `public/_redirects`.

## Limiti noti

- Nell'editor il drag sposta la nota in **altezza** (non il riordino temporale
  orizzontale).
- Legature, articolazioni e dinamiche sono nel modello dati ma non ancora disegnate sul
  pentagramma.

## Licenza

Da definire.
