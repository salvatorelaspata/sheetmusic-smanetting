import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import TeoriaHome from './pages/teoria/TeoriaHome'
import Lezione from './pages/teoria/Lezione'
import PraticaHome from './pages/pratica/PraticaHome'
import RiconosciNota from './pages/pratica/RiconosciNota'
import ValoriPause from './pages/pratica/ValoriPause'
import Ritmo from './pages/pratica/Ritmo'
import Armature from './pages/pratica/Armature'
import Dettato from './pages/pratica/Dettato'
import Componi from './pages/componi/ComponiPage'
import Impostazioni from './pages/Impostazioni'
import Sandbox from './pages/Sandbox'

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
      { path: 'componi', element: <Componi /> },
      { path: 'impostazioni', element: <Impostazioni /> },
      // Pagina di prova della Fase 1 (rimossa in Fase 7).
      { path: 'sandbox', element: <Sandbox /> },
    ],
  },
])
