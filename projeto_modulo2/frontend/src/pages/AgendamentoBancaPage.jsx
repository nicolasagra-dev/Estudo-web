import { useEffect, useMemo, useState } from 'react'

import {
  cancelarAgendamento,
  criarAgendamento,
  listarAgendamentos,
} from '../services/agendamentoBanca.service'
import './AgendamentoBancaPage.css'

const initialForm = {
  tema_tcc_id: '',
  data_hora_inicio: '',
  data_hora_fim: '',
  local_ou_link: '',
}

function formatDateTime(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getApiError(error) {
  const detail = error?.response?.data

  if (!detail) {
    return 'Nao foi possivel conectar com a API.'
  }

  if (typeof detail === 'string') {
    return detail
  }

  if (detail.detail) {
    return detail.detail
  }

  return Object.entries(detail)
    .map(([field, messages]) => {
      const text = Array.isArray(messages) ? messages.join(' ') : messages
      return `${field}: ${text}`
    })
    .join(' ')
}

export default function AgendamentoBancaPage() {
  const [form, setForm] = useState(initialForm)
  const [agendamentos, setAgendamentos] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const sortedAgendamentos = useMemo(() => {
    return [...agendamentos].sort(
      (a, b) => new Date(a.data_hora_inicio) - new Date(b.data_hora_inicio),
    )
  }, [agendamentos])

  async function carregarAgendamentos() {
    setLoading(true)
    setError('')

    try {
      const data = await listarAgendamentos()
      setAgendamentos(Array.isArray(data) ? data : data.results || [])
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarAgendamentos()
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await criarAgendamento({
        ...form,
        data_hora_inicio: new Date(form.data_hora_inicio).toISOString(),
        data_hora_fim: new Date(form.data_hora_fim).toISOString(),
      })
      setForm(initialForm)
      setSuccess('Banca agendada com sucesso.')
      await carregarAgendamentos()
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleCancel(id) {
    const confirmed = window.confirm('Cancelar este agendamento?')
    if (!confirmed) return

    setError('')
    setSuccess('')

    try {
      await cancelarAgendamento(id)
      setSuccess('Agendamento cancelado.')
      await carregarAgendamentos()
    } catch (err) {
      setError(getApiError(err))
    }
  }

  return (
    <main className="agendamento-page">
      <section className="agendamento-header">
        <div>
          <span className="agendamento-kicker">RF-19</span>
          <h1>Agendamento de Bancas</h1>
        </div>
      </section>

      <section className="agendamento-grid">
        <form className="agendamento-form" onSubmit={handleSubmit}>
          <label>
            Tema TCC
            <input
              name="tema_tcc_id"
              value={form.tema_tcc_id}
              onChange={handleChange}
              placeholder="UUID do tema"
              required
            />
          </label>

          <div className="agendamento-inline">
            <label>
              Inicio
              <input
                name="data_hora_inicio"
                type="datetime-local"
                value={form.data_hora_inicio}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Fim
              <input
                name="data_hora_fim"
                type="datetime-local"
                value={form.data_hora_fim}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <label>
            Local ou link
            <input
              name="local_ou_link"
              value={form.local_ou_link}
              onChange={handleChange}
              placeholder="Sala 302 ou link Meet/Zoom"
              required
            />
          </label>

          {error && <p className="agendamento-alert error">{error}</p>}
          {success && <p className="agendamento-alert success">{success}</p>}

          <button className="agendamento-primary" type="submit" disabled={saving}>
            {saving ? 'Agendando...' : 'Agendar banca'}
          </button>
        </form>

        <section className="agendamento-list" aria-live="polite">
          <div className="agendamento-list-header">
            <h2>Bancas agendadas</h2>
            <button type="button" onClick={carregarAgendamentos} disabled={loading}>
              {loading ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>

          {sortedAgendamentos.length === 0 && !loading ? (
            <p className="agendamento-empty">Nenhuma banca agendada.</p>
          ) : (
            <div className="agendamento-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tema</th>
                    <th>Inicio</th>
                    <th>Fim</th>
                    <th>Local</th>
                    <th aria-label="Acoes" />
                  </tr>
                </thead>
                <tbody>
                  {sortedAgendamentos.map((item) => (
                    <tr key={item.id}>
                      <td>{item.tema_tcc_id}</td>
                      <td>{formatDateTime(item.data_hora_inicio)}</td>
                      <td>{formatDateTime(item.data_hora_fim)}</td>
                      <td>{item.local_ou_link}</td>
                      <td>
                        <button
                          className="agendamento-danger"
                          type="button"
                          onClick={() => handleCancel(item.id)}
                        >
                          Cancelar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}
