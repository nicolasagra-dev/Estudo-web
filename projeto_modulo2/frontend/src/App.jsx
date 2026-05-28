import { Navigate, Route, Routes } from 'react-router-dom'

import AgendamentoBancaPage from './pages/AgendamentoBancaPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/bancas/agendamento" replace />} />
      <Route path="/bancas/agendamento" element={<AgendamentoBancaPage />} />
    </Routes>
  )
}
