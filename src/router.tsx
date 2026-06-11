import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import Teoria from './pages/Teoria'
import Pratica from './pages/Pratica'
import Componi from './pages/Componi'
import Impostazioni from './pages/Impostazioni'
import Sandbox from './pages/Sandbox'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'teoria', element: <Teoria /> },
      { path: 'pratica', element: <Pratica /> },
      { path: 'componi', element: <Componi /> },
      { path: 'impostazioni', element: <Impostazioni /> },
      // Pagina di prova della Fase 1 (rimossa in Fase 7).
      { path: 'sandbox', element: <Sandbox /> },
    ],
  },
])
