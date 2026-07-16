// Point d'entrée de l'application React.
// Monte le composant racine <App /> dans le DOM, à l'intérieur de l'élément #root défini dans index.html.
// StrictMode active des vérifications supplémentaires en développement (doubles rendus, détection d'effets de bord).

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
