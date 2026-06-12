import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import App from './App'

// Le pagine sono caricate on-demand (code-splitting): le rotte musicali portano
// con sé VexFlow/Tone, che così non pesano sul caricamento iniziale.
const Home = lazy(() => import('./pages/Home'))
const TeoriaHome = lazy(() => import('./pages/teoria/TeoriaHome'))
const Lezione = lazy(() => import('./pages/teoria/Lezione'))
const PraticaHome = lazy(() => import('./pages/pratica/PraticaHome'))
const RiconosciNota = lazy(() => import('./pages/pratica/RiconosciNota'))
const ValoriPause = lazy(() => import('./pages/pratica/ValoriPause'))
const Ritmo = lazy(() => import('./pages/pratica/Ritmo'))
const Armature = lazy(() => import('./pages/pratica/Armature'))
const Dettato = lazy(() => import('./pages/pratica/Dettato'))
const Intervalli = lazy(() => import('./pages/pratica/Intervalli'))
const Accordi = lazy(() => import('./pages/pratica/Accordi'))
const Componi = lazy(() => import('./pages/componi/ComponiPage'))
const Impostazioni = lazy(() => import('./pages/Impostazioni'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'teoria', element: <TeoriaHome /> },
      { path: 'teoria/:lessonId', element: <Lezione /> },
      { path: 'pratica', element: <PraticaHome /> },
      { path: 'pratica/riconosci-nota', element: <RiconosciNota /> },
      { path: 'pratica/valori-pause', element: <ValoriPause /> },
      { path: 'pratica/ritmo', element: <Ritmo /> },
      { path: 'pratica/armature', element: <Armature /> },
      { path: 'pratica/dettato', element: <Dettato /> },
      { path: 'pratica/intervalli', element: <Intervalli /> },
      { path: 'pratica/accordi', element: <Accordi /> },
      { path: 'componi', element: <Componi /> },
      { path: 'impostazioni', element: <Impostazioni /> },
    ],
  },
  // basename = base di Vite (es. "/sheetmusic-smanetting" su GitHub Pages, "/" altrove).
], { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' })
