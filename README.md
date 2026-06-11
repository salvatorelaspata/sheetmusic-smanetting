# SManetting 🎼

Web app **in italiano** per **imparare a leggere gli spartiti musicali** partendo da
zero. Tre sezioni: **Teoria** (lezioni), **Pratica** (esercizi interattivi) e
**Componi** (editor di spartiti).

> ⚙️ Progetto in costruzione. Pianificazione completa in
> [REQUISITI.md](REQUISITI.md) e [ROADMAP.md](ROADMAP.md).
> Stato attuale: **Fase 0 — impalcatura** completata.

## Stack

- **React + Vite + TypeScript** (strict)
- **Tailwind CSS** (tema chiaro/scuro via variabili CSS)
- **React Router** per la navigazione
- **VexFlow 5** per la notazione musicale *(da Fase 1)*
- **Tone.js 15** per l'audio *(da Fase 1)*
- **Zustand** (+ `persist` su `localStorage`) per lo stato
- **react-i18next** (italiano predefinito, inglese predisposto)
- **PWA** installabile e offline (`vite-plugin-pwa`)
- **Vitest** + Testing Library per i test

## Requisiti

- **Node.js ≥ 18** e **npm**

## Installazione e avvio

```bash
npm install        # installa le dipendenze
npm run dev        # avvia il server di sviluppo (http://localhost:5173)
```

## Script disponibili

| Comando | Descrizione |
|---|---|
| `npm run dev` | Server di sviluppo con HMR |
| `npm run build` | Type-check (`tsc`) + build di produzione in `dist/` |
| `npm run preview` | Anteprima locale della build |
| `npm run test` | Esegue i test una volta (Vitest) |
| `npm run test:watch` | Test in modalità watch |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Struttura del progetto

```
src/
├─ components/   # UI riutilizzabile (layout, music, ui, quiz)
│  └─ music/     # <Staff> (VexFlow) e tastiera — unici wrapper delle librerie
├─ audio/        # audio.ts — unico wrapper di Tone.js (da Fase 1)
├─ core/         # logica musicale pura: modello, durate, teoria, MusicXML (da Fase 1)
├─ data/         # contenuti di lezioni ed esercizi (da Fase 3/4)
├─ state/        # store Zustand (settings, progress, stats, compositions)
├─ pages/        # Home, Teoria, Pratica, Componi, Impostazioni
└─ i18n/         # traduzioni it / en
```

> **Principio chiave:** il **modello dati** (`core/`) è l'unica fonte di verità;
> VexFlow e Tone.js sono usati **solo** dentro `components/music/Staff.tsx` e
> `audio/audio.ts`. Nessuna pagina importa quelle librerie direttamente.

## Deploy

Build statica (`npm run build` → `dist/`). Sono incluse le configurazioni per il
fallback SPA:

- **Vercel** — `vercel.json` (rewrite verso `index.html`), zero config.
- **Netlify** — `public/_redirects`.
- **GitHub Pages** — impostare `base: '/<nome-repo>/'` in `vite.config.ts` e
  pubblicare la cartella `dist/`.

## Licenza

Da definire.
