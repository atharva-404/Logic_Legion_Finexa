import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import CursorFX from './components/CursorFX.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <CursorFX />
        <App />
    </React.StrictMode>,
)
