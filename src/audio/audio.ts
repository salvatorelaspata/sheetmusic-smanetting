import * as Tone from 'tone'
import type { NoteElement, Pitch } from '../core/model'
import { durationSeconds } from '../core/durations'
import { frequencyOf } from '../core/pitch'

/**
 * Unico wrapper di Tone.js. Tutta l'app passa da qui (vedi REQUISITI.md §3.2).
 * L'AudioContext parte solo dopo un gesto utente: ensureAudio() chiama Tone.start().
 * In Tone.js v15 si usano getTransport()/getDraw()/getDestination().
 */

let started = false
let synth: Tone.PolySynth | null = null
let metroSynth: Tone.MembraneSynth | null = null
let metroLoop: Tone.Loop | null = null
let masterVolume = 0.8

function applyVolume(): void {
  Tone.getDestination().volume.value = masterVolume <= 0 ? -Infinity : Tone.gainToDb(masterVolume)
}

/** Inizializza l'audio (idempotente). Va chiamata da un handler di evento utente. */
export async function ensureAudio(): Promise<void> {
  if (started && synth) return
  await Tone.start()
  if (!synth) {
    synth = new Tone.PolySynth(Tone.Synth).toDestination()
  }
  started = true
  applyVolume()
}

export function isAudioStarted(): boolean {
  return started
}

/** Volume globale 0..1 (0 = muto). Ricordato e applicato all'avvio dell'audio. */
export function setMasterVolume(value: number): void {
  masterVolume = Math.min(1, Math.max(0, value))
  if (started) applyVolume()
}

export async function playPitch(pitch: Pitch, seconds = 0.7): Promise<void> {
  await ensureAudio()
  synth!.triggerAttackRelease(frequencyOf(pitch), seconds)
}

export async function playChord(pitches: Pitch[], seconds = 0.9): Promise<void> {
  await ensureAudio()
  if (pitches.length === 0) return
  synth!.triggerAttackRelease(pitches.map(frequencyOf), seconds)
}

export interface PlaybackHandle {
  stop: () => void
}

/**
 * Riproduce una sequenza di elementi, con callback `onNote` sincronizzata
 * visivamente tramite Tone.getDraw() (per il cursore) e `onEnd` a fine brano.
 */
export async function playSequence(
  elements: NoteElement[],
  opts: { bpm: number; onNote?: (index: number) => void; onEnd?: () => void },
): Promise<PlaybackHandle> {
  await ensureAudio()
  const transport = Tone.getTransport()
  transport.stop()
  transport.cancel()
  transport.bpm.value = opts.bpm

  let cursor = 0
  elements.forEach((el, i) => {
    const seconds = durationSeconds(el.duration, opts.bpm)
    const at = cursor
    transport.schedule((time) => {
      if (el.kind === 'note' && el.pitches.length > 0) {
        synth!.triggerAttackRelease(
          el.pitches.map(frequencyOf),
          Math.max(0.06, seconds * 0.92),
          time,
        )
      }
      Tone.getDraw().schedule(() => opts.onNote?.(i), time)
    }, at)
    cursor += seconds
  })

  transport.schedule((time) => {
    Tone.getDraw().schedule(() => opts.onEnd?.(), time)
  }, cursor + 0.02)

  transport.start()
  return {
    stop: () => {
      transport.stop()
      transport.cancel()
    },
  }
}

export function stopPlayback(): void {
  const transport = Tone.getTransport()
  transport.stop()
  transport.cancel()
}

export function pausePlayback(): void {
  Tone.getTransport().pause()
}

export function resumePlayback(): void {
  Tone.getTransport().start()
}

/** Avvia il metronomo. `onBeat` riceve l'indice del movimento nella battuta. */
export async function startMetronome(
  bpm: number,
  opts: { beatsPerBar?: number; onBeat?: (beatInBar: number) => void } = {},
): Promise<void> {
  await ensureAudio()
  const beatsPerBar = opts.beatsPerBar ?? 4
  const transport = Tone.getTransport()
  transport.bpm.value = bpm
  if (!metroSynth) metroSynth = new Tone.MembraneSynth().toDestination()

  metroLoop?.dispose()
  let beat = 0
  metroLoop = new Tone.Loop((time) => {
    const inBar = beat % beatsPerBar
    const accent = inBar === 0
    metroSynth!.triggerAttackRelease(accent ? 'C3' : 'C2', '32n', time, accent ? 1 : 0.7)
    Tone.getDraw().schedule(() => opts.onBeat?.(inBar), time)
    beat++
  }, '4n')
  metroLoop.start(0)
  transport.start()
}

export function stopMetronome(): void {
  metroLoop?.dispose()
  metroLoop = null
  Tone.getTransport().stop()
}

/** Riproduce un singolo "click" di metronomo (per gli esercizi ritmici). */
export async function playClick(accent = false): Promise<void> {
  await ensureAudio()
  if (!metroSynth) metroSynth = new Tone.MembraneSynth().toDestination()
  metroSynth.triggerAttackRelease(accent ? 'C3' : 'C2', '32n')
}

/** Tempo audio corrente in secondi (per misurare la precisione ritmica). */
export function audioNow(): number {
  return Tone.now()
}
