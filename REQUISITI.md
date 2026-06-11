# SManetting — Imparare a leggere gli spartiti

> Documento di requisiti e architettura
> Versione 1.0 — bozza di pianificazione

Web app **in italiano** per imparare a leggere la notazione musicale partendo da
zero, organizzata in tre sezioni — **Teoria**, **Pratica**, **Componi** — più una
**Home/Dashboard** e le **Impostazioni**. Target: principiante assoluto.

---

## 1. Visione e principi di prodotto

- **Progressività**: ogni concetto è introdotto solo dopo i suoi prerequisiti; le
  lezioni si sbloccano superando il quiz precedente.
- **Visivo prima che testuale**: ogni concetto è accompagnato da un esempio sul
  pentagramma, cliccabile per ascoltarne il suono.
- **Feedback immediato**: nella Pratica ogni risposta produce subito esito + suono
  della nota corretta; a fine sessione, riepilogo degli errori.
- **Senza backend**: tutti i dati (progressi, statistiche, composizioni) vivono in
  `localStorage`. L'app è installabile e usabile offline (PWA).

### Pubblico e tono
Target primario: **adulti autodidatti**. Estetica **sobria, moderna, professionale**
(app educativa, non giocattolo), con **gamification leggera** (progressi, streak,
badge discreti). Linguaggio chiaro ma adulto. Niente infantilizzazione.

---

## 2. Stack tecnologico

| Ambito | Scelta | Versione di riferimento | Note |
|---|---|---|---|
| UI | React + Vite + TypeScript | React 18, Vite 5 | strict mode TS |
| Stile | Tailwind CSS | 3.x | design tokens via `tailwind.config` |
| Routing | React Router | 6.x | rotte per sezione |
| Notazione | **VexFlow** | **5.0.0** (stabile) | output **SVG**, TS-native |
| Audio | **Tone.js** | **15.1.22** | usa `getTransport()` (il `Transport` globale è deprecato) |
| Stato | **Zustand** | 4.x | uno store per dominio |
| i18n | react-i18next | 14.x | `it` default, `en` predisposto |
| Persistenza | `localStorage` | — | con `schemaVersion` per migrazioni |
| PWA | vite-plugin-pwa | — | offline + installabile |
| Test | **Vitest** + Testing Library | — | focus su `core/` (logica musicale) |

> Versioni `latest` verificate su npm in fase di pianificazione: `vexflow@5.0.0`,
> `tone@15.1.22`.

---

## 3. Principi architetturali (i 3 pilastri)

### 3.1 Il modello dati è l'unica fonte di verità
VexFlow è un **motore di rendering**, non un editor: non conserva stato editabile né
offre hit-testing. Perciò **non** memorizziamo mai oggetti VexFlow nello stato
dell'app. Definiamo un **modello dati nostro** (`core/model.ts`) e da quello
deriviamo *tutto*:

```
            ┌──────────────► <Staff> ──► VexFlow ──► SVG (vista)
 Score      │
 (modello) ─┼──────────────► audio.ts ─► Tone.js ─► suono (playback)
            │
            └──────────────► musicxml.ts ─► file .musicxml (export)
```

L'editor *Componi* e l'esercizio *Riconosci la nota* sono **livelli di interazione**
che traducono i clic (coordinate) in posizione musicale (altezza/tempo) e
**modificano il modello**; la vista si ri-renderizza di conseguenza.

### 3.2 Due soli punti di contatto con le librerie esterne
Tutta l'app usa **solo** questi due moduli; nessuna pagina importa mai VexFlow o
Tone.js direttamente.

- **`components/music/Staff.tsx`** — incapsula VexFlow. Props: contenuto musicale
  (un `Score` o un frammento), opzioni (chiave, armatura, tempo, larghezza),
  callback `onElementClick(elementId)`. Gestisce ridimensionamento responsive
  (ResizeObserver) e ri-render.
- **`audio/audio.ts`** — incapsula Tone.js. API: `init()` (dopo gesto utente,
  `Tone.start()`), `playNote(pitch, dur)`, `playScore(score, { onTick })`,
  `stop()`, `setTempo()`, `metronome.start/stop()`, `setInstrument()`, `setVolume()`.

### 3.3 Contenuti separati dal codice
Lezioni, quiz e configurazioni degli esercizi stanno in `src/data/*.ts` come dati
tipizzati, **non** hard-coded nei componenti, così da ampliarli senza toccare la UI.

---

## 4. Struttura del progetto

```
sheetmusic-smanetting/
├─ public/
│  ├─ icons/                 # icone PWA
│  └─ manifest.webmanifest
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx                # provider + router + layout
│  ├─ i18n/ { index.ts, it.json, en.json }
│  ├─ components/
│  │  ├─ layout/             # NavBar, PageContainer, SettingsButton
│  │  ├─ music/
│  │  │  ├─ Staff.tsx        # WRAPPER VexFlow (UNICO)
│  │  │  ├─ PianoKeyboard.tsx# tastiera virtuale (input/output)
│  │  │  └─ NotePalette.tsx  # palette durate/alterazioni (Componi)
│  │  ├─ ui/                 # Button, Card, Modal, ProgressBar, Badge, Toast…
│  │  └─ quiz/               # QuizRunner, QuestionCard, ResultSummary
│  ├─ audio/
│  │  └─ audio.ts            # WRAPPER Tone.js (UNICO)
│  ├─ core/                  # logica musicale PURA (no React, no DOM)
│  │  ├─ model.ts            # tipi Score / Measure / Voice / Note / Pitch…
│  │  ├─ ids.ts              # generazione id stabili
│  │  ├─ durations.ts        # ticks, punti, conversioni durata↔simbolo
│  │  ├─ pitch.ts            # ottave, conversione IT↔EN, riga/spazio sul rigo
│  │  ├─ theory.ts           # scale, intervalli, armature (circolo delle quinte)
│  │  ├─ validation.ts       # durata battute vs indicazione di tempo
│  │  ├─ musicxml.ts         # serializzatore MusicXML (export)
│  │  └─ vexflowAdapter.ts   # Score → oggetti VexFlow (usato SOLO da Staff)
│  ├─ data/
│  │  ├─ moduli.ts           # elenco moduli Teoria
│  │  ├─ lezioni.ts          # contenuti delle lezioni + quiz
│  │  └─ eserciziConfig.ts   # livelli/parametri degli esercizi Pratica
│  ├─ state/                 # store Zustand (persistiti)
│  │  ├─ settingsStore.ts
│  │  ├─ progressStore.ts
│  │  ├─ statsStore.ts
│  │  └─ compositionsStore.ts
│  ├─ pages/
│  │  ├─ Home.tsx
│  │  ├─ teoria/ { TeoriaHome.tsx, Lezione.tsx }
│  │  ├─ pratica/ { PraticaHome.tsx, RiconosciNota.tsx, ValoriPause.tsx,
│  │  │             Ritmo.tsx, Armature.tsx, Dettato.tsx }
│  │  └─ componi/ { Componi.tsx, editor/* }
│  ├─ hooks/                 # useResizeObserver, useKeyboardShortcuts…
│  └─ styles/
├─ tests/                    # Vitest (specchio di core/)
├─ REQUISITI.md
├─ ROADMAP.md
└─ README.md
```

---

## 5. Modello dati musicale (`core/model.ts`)

Internamente le note usano i nomi **anglosassoni** (C–B) per neutralità; la
visualizzazione IT/EN è solo un livello di presentazione (`pitch.ts`).

```ts
type Step = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
type Accidental = 'natural' | 'sharp' | 'flat' | 'double-sharp' | 'double-flat';

interface Pitch {
  step: Step;
  octave: number;            // ottava scientifica: C4 = Do centrale
  accidental?: Accidental;   // alterazione esplicita (oltre all'armatura)
}

type DurationBase = 'whole' | 'half' | 'quarter' | 'eighth' | '16th' | '32nd';
interface Duration {
  base: DurationBase;
  dots: 0 | 1 | 2;           // punto / doppio punto
}

interface NoteElement {
  id: string;
  kind: 'note' | 'rest';
  duration: Duration;
  pitches: Pitch[];          // [] se pausa, 1 nota, >1 accordo
  tie?: 'start' | 'stop' | 'continue';   // legatura di valore
  articulations?: Articulation[];        // staccato, accento…
  slur?: 'start' | 'stop';               // legatura di portamento
  dynamic?: Dynamic;                     // p, mf, f, cresc…
}

interface Voice { id: string; elements: NoteElement[]; }

interface Measure {
  id: string;
  voices: Voice[];           // v1: una voce per battuta
  timeSignature?: TimeSignature; // override locale (cambi di tempo); altrimenti eredita
}

type ClefType = 'treble' | 'bass';
interface TimeSignature { beats: number; beatType: number; }  // 4/4, 3/4, 2/4, 6/8
interface KeySignature { fifths: number; }  // -7..+7 sul circolo delle quinte (modo maggiore)

interface Score {
  id: string;
  title: string;
  clef: ClefType;
  timeSignature: TimeSignature;
  keySignature: KeySignature;
  tempoBpm: number;
  measures: Measure[];
  createdAt: number; updatedAt: number;
  schemaVersion: number;
}
```

**Durate in ticks** (`durations.ts`): PPQ = 480 → `whole`=1920, `half`=960,
`quarter`=480, `eighth`=240, `16th`=120, `32nd`=60; un punto aggiunge metà valore,
doppio punto tre quarti. La **validazione battuta** confronta la somma dei ticks
degli elementi con `beats × (1920 / beatType)`.

---

## 6. Stato globale e persistenza

Quattro store Zustand, ciascuno persistito in `localStorage` con prefisso
`smanetting:` e `schemaVersion` per migrazioni future.

| Store | Contenuto | Chiave |
|---|---|---|
| `settingsStore` | lingua, mostra notazione anglosassone, tema, volume, strumento | `smanetting:settings` |
| `progressStore` | lezioni completate, punteggi quiz, moduli sbloccati | `smanetting:progress` |
| `statsStore` | per esercizio: tentativi, corrette, accuratezza, miglior streak, storico | `smanetting:stats` |
| `compositionsStore` | elenco composizioni salvate (`Score[]`) | `smanetting:compositions` |

> Undo/redo dell'editor **non** è persistito: vive nello stato locale dell'editor
> Componi (stack di snapshot del `Score` in lavorazione).

---

## 7. Requisiti funzionali

### 7.1 Home / Dashboard
- Riepilogo **progressi Teoria** (moduli completati / totali, prossima lezione).
- **Statistiche Pratica** (accuratezza, miglior streak, esercizio più allenato).
- **Ultime composizioni** salvate (apri / duplica / elimina).
- CTA rapide: "Riprendi la lezione", "Allenati", "Nuova composizione".

### 7.2 Sezione Teoria
Moduli progressivi; ogni **lezione** contiene: spiegazione testuale semplice,
**esempi VexFlow cliccabili** (ascolto del suono), e un **mini-quiz 3–5 domande**.
Superare il quiz (soglia ≥ 80%) **sblocca** la lezione successiva e aggiorna i
progressi.

**Moduli (in ordine):**
1. Il pentagramma e le chiavi (violino e basso)
2. I nomi delle note: linee, spazi e tagli addizionali
3. I valori delle note: semibreve, minima, semiminima, croma, semicroma
4. Le pause e i loro valori
5. Punto di valore e legatura di valore
6. Le indicazioni di tempo: 4/4, 3/4, 2/4, 6/8 e il concetto di battuta
7. Le alterazioni: diesis, bemolle, bequadro
8. Armature di chiave e scale maggiori
9. Gli intervalli di base
10. Dinamiche e articolazioni (p, mf, f, crescendo, staccato, legato…)

**Tipi di domanda quiz** (riusabili): scelta multipla, identifica-la-nota (clic sul
nome o sul pentagramma), abbina (simbolo↔durata), vero/falso.

### 7.3 Sezione Pratica
Esercizi con **punteggio**, **streak**, **difficoltà crescente** e **statistiche
salvate** (alimentano la dashboard). Feedback immediato + suono della nota corretta;
riepilogo errori a fine sessione.

1. **Riconosci la nota** *(principale)* — una nota casuale appare sul pentagramma;
   l'utente risponde cliccando il nome (Do–Si) **oppure** il tasto giusto sulla
   **tastiera di pianoforte virtuale**. Livelli: chiave di violino senza tagli →
   chiave di basso → tagli addizionali → note con alterazioni. **Modalità a tempo**
   opzionale.
2. **Valori e pause** — abbinare il simbolo mostrato alla sua durata.
3. **Allenamento ritmico** — mostrata una battuta semplice; con **metronomo** attivo
   l'utente la riproduce toccando/cliccando a tempo; **feedback sulla precisione**
   (scarto temporale per ogni colpo).
4. **Quiz sulle armature** — riconoscere la tonalità maggiore dall'armatura.
5. **Dettato melodico semplice** *(priorità minore)* — ascoltare 3–4 note e
   selezionarle sul pentagramma.

### 7.4 Sezione Componi (editor)

**v1 — Essenziale**
- Pentagramma su più battute con **a capo automatico**.
- Impostazioni brano: **chiave, indicazione di tempo, armatura, BPM, titolo**.
- **Palette**: durate (semibreve→semicroma), pause, diesis/bemolle/bequadro, punto.
- **Inserimento note** cliccando sul pentagramma (la posizione verticale = altezza),
  con **anteprima** della nota sotto il cursore prima del clic.
- **Eliminazione** nota; **aggiunta/rimozione battute**.
- **Validazione** durata di ogni battuta vs indicazione di tempo, con **segnalazione
  visiva** delle battute incomplete o eccedenti.
- **Playback** (Tone.js): play / pausa / stop + **cursore** che evidenzia la nota in
  riproduzione.
- **Salvataggio/caricamento** con nome in `localStorage`.
- **Export MusicXML** e **stampa/PDF** via finestra di stampa del browser.

**v2 — Avanzato** *(fase successiva, già prevista nel piano)*
- **Selezione** (singola/multipla) e **spostamento** delle note via drag.
- **Undo/redo**.
- Gestione battute avanzata (inserisci/elimina in mezzo, copia/incolla).

---

## 8. Requisiti non funzionali

- **Responsive**: desktop e mobile; nella Pratica i controlli restano usabili al
  **tocco** (bersagli ≥ 44px). `<Staff>` ridimensiona via ResizeObserver.
- **Accessibilità (base)**: esercizi rispondibili da **tastiera fisica**; contrasti
  AA; focus visibile; `aria-label` sui controlli musicali; alternative testuali agli
  SVG.
- **Audio dopo gesto utente**: `Tone.start()` viene chiamato al primo clic/tap
  (vincolo AudioContext dei browser); finché non avviene, l'audio è "armato" ma muto.
- **Performance**: render VexFlow solo quando il modello cambia (memoizzazione);
  evitare ri-render dell'intero score per ogni nota dove possibile.
- **i18n**: tutte le stringhe da file di traduzione; `it` completo, `en` predisposto.
  Notazione musicale IT predefinita, EN attivabile in aggiunta dalle impostazioni.
- **PWA/offline**: app installabile, asset e dati disponibili offline.
- **Tipizzazione**: TypeScript `strict`; nessun `any` nel `core/`.

---

## 9. Export e stampa

- **MusicXML** (`core/musicxml.ts`): serializzatore dedicato `Score → string` (XML
  `score-partwise`), scaricato come `.musicxml`. Scelta a basso costo e senza
  dipendenze pesanti perché possediamo già il modello; in futuro valutabile
  `@stringsync/musicxml` per validazione formale.
- **Stampa/PDF**: foglio di stile `@media print` dedicato + `window.print()`;
  l'utente "stampa su PDF" dal browser.

---

## 10. Internazionalizzazione

- `react-i18next`; namespace per sezione (`common`, `teoria`, `pratica`, `componi`).
- Mappa nomi nota IT↔EN in `core/pitch.ts`:
  `C=Do, D=Re, E=Mi, F=Fa, G=Sol, A=La, B=Si`.
- Impostazione "mostra anche notazione anglosassone" → la UI mostra es. **Do (C)**.

---

## 11. Testing (Vitest)

Focus sulla **logica pura** (`core/`), dove i bug sono più insidiosi e i test più
redditizi:
- `durations.ts`: ticks, punti, somme.
- `pitch.ts`: conversione IT↔EN, calcolo riga/spazio sul rigo per chiave.
- `theory.ts`: armature (fifths→alterazioni), scale maggiori, intervalli.
- `validation.ts`: battute incomplete/eccedenti per varie indicazioni di tempo.
- `musicxml.ts`: snapshot di un piccolo `Score` → XML atteso.
- Smoke test dei componenti chiave (`Staff` monta senza errori, `QuizRunner` calcola
  il punteggio).

---

## 12. Deploy

- Build statica Vite; config pronta per **Vercel/Netlify** (zero-config) o **GitHub
  Pages** (con `base` impostato sul nome repo).
- Nessun segreto, nessun backend: deploy = pubblicazione della cartella `dist/`.

---

## 13. Decisioni già prese

| Tema | Decisione |
|---|---|
| Stato | Zustand (uno store per dominio) |
| Notazione interna | anglosassone; presentazione IT/EN a parte |
| VexFlow | v5 stabile, output SVG |
| Tone.js | v15, `getTransport()` |
| Editor Componi | **essenziale prima**, avanzato (drag/undo-redo) in fase successiva |
| Pubblico/tono | adulti autodidatti, sobrio/professionale, gamification leggera |
| Extra inclusi | **PWA/offline**, **test Vitest**, **config deploy** |
| MusicXML | serializzatore dedicato (no dipendenze pesanti) |

## 14. Punti aperti (da decidere strada facendo, non bloccanti)
- Strumento audio di default (campionato vs sintetizzato Tone.js) e se includere
  campioni di pianoforte.
- Soglia esatta di superamento quiz (proposta: 80%).
- Set di badge/gamification (definirli quando la dashboard prende forma).
