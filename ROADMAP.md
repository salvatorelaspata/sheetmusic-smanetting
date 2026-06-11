# SManetting — Roadmap di implementazione

> Piano di sviluppo a fasi per l'**intero prodotto** (tutte le sezioni).
> Vedi [REQUISITI.md](REQUISITI.md) per il dettaglio funzionale e architetturale.

## Come leggere questo documento
Ogni fase è un **traguardo** con: obiettivo, task (checkbox), file principali e una
**Definizione di "fatto" (DoD)** osservabile. Le caselle servono anche come
tracciamento dell'avanzamento.

### Quadro delle fasi e dipendenze

| Fase | Titolo | Dipende da | Parallelizzabile con |
|---|---|---|---|
| 0 | Setup e impalcatura | — | — |
| 1 | Fondamenta musicali (`core` + `Staff` + `audio`) | 0 | — |
| 2 | Shell app, navigazione, Home, Impostazioni, store | 0 | 1 |
| 3 | Teoria | 1, 2 | 4, 5 |
| 4 | Pratica | 1, 2 | 3, 5 |
| 5 | Componi — essenziale | 1, 2 | 3, 4 |
| 6 | Componi — avanzato | 5 | — |
| 7 | Rifinitura (PWA, a11y, mobile, EN, perf, deploy) | 3, 4, 5 | — |

> **Fondamenta sequenziali**: 0 → 1 → 2. Poi **3, 4, 5 sono in gran parte
> indipendenti** (parallelizzabili). 6 segue 5; 7 chiude tutto.

---

## Fase 0 — Setup e impalcatura
**Obiettivo:** progetto avviabile, buildabile, testabile, installabile (PWA) e
deployabile, ancora senza funzionalità.

- [ ] Init **Vite** (`react-ts`) + installazione dipendenze
- [ ] **Tailwind** + design tokens (palette sobria, tipografia, spaziature, tema
      chiaro/scuro)
- [ ] **React Router** con rotte placeholder: `/`, `/teoria`, `/pratica`, `/componi`,
      `/impostazioni`
- [ ] **Zustand** + middleware `persist` (impalcatura di uno store di prova)
- [ ] **i18n** (`react-i18next`) con `it.json`/`en.json` e poche chiavi di esempio
- [ ] **PWA** (`vite-plugin-pwa`): manifest, icone, service worker `autoUpdate`
- [ ] **Vitest** + Testing Library configurati + 1 test fittizio verde
- [ ] **ESLint + Prettier**, `tsconfig` in `strict`
- [ ] **Config deploy** (Vercel/Netlify o `base` per GitHub Pages) + README iniziale

**File:** `vite.config.ts`, `tailwind.config.ts`, `src/main.tsx`, `src/App.tsx`,
`src/i18n/*`, `public/manifest.webmanifest`.
**DoD:** `npm run dev` mostra il guscio con barra di navigazione; `npm run build`
passa; `npm run test` verde; l'app risulta **installabile** (PWA).

---

## Fase 1 — Fondamenta musicali (`core` + `<Staff>` + `audio.ts`)
**Obiettivo:** il modello dati e i due wrapper esterni funzionano; esiste una pagina
demo che renderizza un pentagramma e suona le note al clic. È la fase **più
rischiosa** e va consolidata bene.

- [ ] `core/model.ts` — tipi `Score/Measure/Voice/NoteElement/Pitch/Duration…`
- [ ] `core/durations.ts` — ticks, punti, conversione durata↔simbolo **+ test**
- [ ] `core/pitch.ts` — conversione IT↔EN, calcolo riga/spazio sul rigo per chiave
      **+ test**
- [ ] `core/theory.ts` — armature (`fifths`→alterazioni), scale maggiori, intervalli
      **+ test**
- [ ] `core/validation.ts` — durata battuta vs indicazione di tempo **+ test**
- [ ] `core/vexflowAdapter.ts` — `Score`/frammento → oggetti VexFlow
- [ ] `components/music/Staff.tsx` — **wrapper VexFlow unico**: render, ResizeObserver,
      `onElementClick(elementId)`
- [ ] `audio/audio.ts` — **wrapper Tone.js unico**: `init()` (con `Tone.start()`),
      `playNote`, `playScore({onTick})`, `stop`, `setTempo`, `metronome`,
      `setInstrument`, `setVolume`
- [ ] Pagina **sandbox** interna: pentagramma con note cliccabili che suonano

**DoD:** la sandbox mostra un pentagramma corretto; cliccando una nota parte il suono
(dopo il primo gesto utente); tutti i test di `core/` verdi.

---

## Fase 2 — Shell app: navigazione, Home, Impostazioni, store
**Obiettivo:** guscio dell'app completo e navigabile; impostazioni operative;
dashboard che legge gli store (con stati "vuoti" corretti finché le sezioni non li
popolano).

- [ ] Layout definitivo: **NavBar** (Home/Teoria/Pratica/Componi + icona
      Impostazioni), `PageContainer` responsive
- [ ] Libreria **UI base**: `Button`, `Card`, `Modal`, `ProgressBar`, `Badge`,
      `Toast`
- [ ] `settingsStore` completo (lingua, notazione EN aggiuntiva, tema, volume,
      strumento) + **pannello Impostazioni**
- [ ] `progressStore`, `statsStore`, `compositionsStore` (persist + `schemaVersion`)
- [ ] **Home/Dashboard**: progressi Teoria, statistiche Pratica, ultime composizioni,
      CTA rapide

**DoD:** tutte le rotte raggiungibili; cambiare lingua/tema/volume ha effetto
immediato; la dashboard mostra correttamente lo stato iniziale vuoto.

---

## Fase 3 — Teoria
**Obiettivo:** percorso lezioni completo, con esempi cliccabili, quiz e sblocco
progressivo, e i contenuti dei 10 moduli.

- [ ] Tipi contenuto lezione/quiz in `data/` + `data/moduli.ts`
- [ ] **Motore lezione** (`pages/teoria/Lezione.tsx`): blocchi testo + esempi `<Staff>`
      cliccabili (ascolto)
- [ ] **`components/quiz/QuizRunner`** + tipi di domanda: scelta multipla,
      identifica-nota, abbina (simbolo↔durata), vero/falso
- [ ] Logica **sblocco progressivo** (soglia ≥ 80%) + aggiornamento `progressStore`
- [ ] **TeoriaHome**: griglia moduli con stato (bloccato / in corso / completato)
- [ ] **Contenuti dei 10 moduli** (testi + esempi + quiz) in `data/lezioni.ts`:
  - [ ] 1. Pentagramma e chiavi (violino, basso)
  - [ ] 2. Nomi delle note: linee, spazi, tagli addizionali
  - [ ] 3. Valori delle note (semibreve→semicroma)
  - [ ] 4. Pause e loro valori
  - [ ] 5. Punto di valore e legatura di valore
  - [ ] 6. Indicazioni di tempo (4/4, 3/4, 2/4, 6/8) e battuta
  - [ ] 7. Alterazioni (diesis, bemolle, bequadro)
  - [ ] 8. Armature di chiave e scale maggiori
  - [ ] 9. Intervalli di base
  - [ ] 10. Dinamiche e articolazioni

**DoD:** si percorrono i moduli in ordine; superare il quiz sblocca il successivo e
aggiorna la dashboard; gli esempi suonano.

---

## Fase 4 — Pratica
**Obiettivo:** i cinque esercizi giocabili, con punteggio/streak/feedback e
statistiche salvate.

- [ ] **Infrastruttura esercizio** riusabile: punteggio, streak, timer opzionale,
      raccolta errori, **riepilogo finale**, scrittura `statsStore`
- [ ] `components/music/PianoKeyboard.tsx` — tastiera virtuale (input/output) +
      supporto **tastiera fisica**
- [ ] **Es. 1 — Riconosci la nota** (principale): 4 livelli (violino → basso → tagli
      addizionali → alterazioni) + **modalità a tempo**
- [ ] **Es. 2 — Valori e pause** (abbina simbolo↔durata)
- [ ] **Es. 3 — Allenamento ritmico** (metronomo + cattura dei tempi + punteggio di
      precisione)
- [ ] **Es. 4 — Quiz armature** (tonalità maggiore dall'armatura)
- [ ] **Es. 5 — Dettato melodico** (ascolta 3–4 note, selezionale sul pentagramma)
- [ ] **PraticaHome**: accesso agli esercizi + statistiche per esercizio

**DoD:** ogni esercizio è giocabile con feedback immediato + suono della nota
corretta; le statistiche compaiono nella dashboard.

---

## Fase 5 — Componi (essenziale)
**Obiettivo:** editor utilizzabile end-to-end: comporre, ascoltare col cursore,
salvare/riaprire, esportare MusicXML, stampare.

- [ ] Stato editor (Score in lavorazione) + **barra impostazioni brano**
      (chiave / tempo / armatura / BPM / titolo)
- [ ] **NotePalette** (durate, pause, diesis/bemolle/bequadro, punto)
- [ ] Rendering **multi-battuta con a capo automatico** in `<Staff>`
- [ ] **Hit-testing inserimento**: coordinata clic → (battuta, altezza); **anteprima**
      nota sotto il cursore prima del clic
- [ ] **Eliminazione** nota; **aggiungi/rimuovi battuta**
- [ ] **Validazione** battute con **segnalazione visiva** (incompleta / eccedente)
- [ ] **Playback** con **cursore** (`audio.playScore` + `onTick` evidenzia la nota)
- [ ] **Salva/carica** composizioni (`compositionsStore`) con nome
- [ ] **Export MusicXML** (`core/musicxml.ts`) + download `.musicxml`
- [ ] **Stampa**: foglio `@media print` + `window.print()`

**DoD:** si compone un brano su più battute, lo si ascolta col cursore, lo si
salva/riapre, lo si esporta in MusicXML e lo si stampa in PDF.

---

## Fase 6 — Componi (avanzato)
**Obiettivo:** editing fluido e produttivo.

- [ ] **Selezione** nota (singola) e **multipla**
- [ ] **Spostamento via drag** (altezza/tempo) con snap
- [ ] **Undo/redo** (stack di snapshot del `Score`)
- [ ] Operazioni battuta avanzate (inserisci in mezzo, copia/incolla)
- [ ] **Scorciatoie tastiera** (durate 1–6, frecce, Canc, Ctrl+Z / Ctrl+Y)

**DoD:** spostamento note via drag affidabile; undo/redo coerente; scorciatoie
operative.

---

## Fase 7 — Rifinitura e rilascio
**Obiettivo:** qualità trasversale e pubblicazione.

- [ ] **PWA offline** completo (precache, fallback, verifica uso senza rete)
- [ ] **Accessibilità**: percorso completo da tastiera, `aria`, contrasti, focus
- [ ] **Mobile/touch**: esercizi, palette e tastiera ottimizzati per il tocco
- [ ] **Traduzione EN** completa + verifica notazione anglosassone
- [ ] **Performance**: memoizzazione dei render, profiling di `<Staff>` su score lunghi
- [ ] **README** definitivo (install / avvio / build / deploy) + screenshot
- [ ] **Deploy** pubblico

**DoD:** app installabile e usabile **offline** su mobile e desktop; EN funzionante;
README completo; build pubblicata.

---

## Note di sequenza e rischio
- **Rischio principale:** il livello di **interazione su VexFlow** (hit-testing per
  inserimento note in Componi e per la selezione sul pentagramma nel Dettato). Va
  prototipato presto nella **Fase 1** (sandbox) per validare l'approccio
  coordinate→posizione musicale prima di costruirci sopra.
- **Audio e gesto utente:** integrare `Tone.start()` fin dalla sandbox (Fase 1) per
  non scoprire tardi problemi di AudioContext.
- **Contenuti Teoria:** i testi/quiz dei 10 moduli sono lavoro ampio ma indipendente
  dal codice (stanno in `data/`): possono procedere in parallelo allo sviluppo.
