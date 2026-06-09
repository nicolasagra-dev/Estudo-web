import { useEffect, useMemo, useRef, useState } from 'react'

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
  local_ou_link: 'Sala 301',
}

function formatDateTime(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getLocalISOString(date = new Date()) {
  const tzoffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - tzoffset).toISOString().slice(0, 16)
}

function getApiError(error) {
  const detail = error?.response?.data

  if (!detail) {
    return 'Não foi possível conectar com a API.'
  }

  if (typeof detail === 'string') {
    if (detail.trim().startsWith('<!DOCTYPE') || detail.includes('<html') || detail.includes('Django')) {
      return 'Erro interno do servidor. O tema informado pode já ter uma banca agendada ou ocorreu um conflito de dados no banco.'
    }
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

function InstitutoFederalLogo() {
  const moduleSize = 20
  const gap = moduleSize * 0.2
  const radius = moduleSize * 0.1
  const circleRadius = moduleSize * 0.55

  return (
    <svg
      className="ifam-logo-svg"
      viewBox="0 0 360 128"
      width="360"
      height="128"
      role="img"
      aria-labelledby="ifam-logo-title"
    >
      <title id="ifam-logo-title">Instituto Federal Amazonas - Campus Manaus Zona Leste</title>
      <g transform="translate(12, 12)">
        <circle cx={moduleSize / 2} cy={moduleSize / 2} r={circleRadius} fill="#cd191e" />
        <rect x="0" y={moduleSize + gap} width={moduleSize} height={moduleSize} fill="#2f9e41" rx={radius} />
        <rect x="0" y={(moduleSize + gap) * 2} width={moduleSize} height={moduleSize} fill="#2f9e41" rx={radius} />
        <rect x="0" y={(moduleSize + gap) * 3} width={moduleSize} height={moduleSize} fill="#2f9e41" rx={radius} />

        <rect x={moduleSize + gap} y="0" width={moduleSize} height={moduleSize} fill="#2f9e41" rx={radius} />
        <rect x={moduleSize + gap} y={moduleSize + gap} width={moduleSize} height={moduleSize} fill="#2f9e41" rx={radius} />
        <rect x={moduleSize + gap} y={(moduleSize + gap) * 2} width={moduleSize} height={moduleSize} fill="#2f9e41" rx={radius} />
        <rect x={moduleSize + gap} y={(moduleSize + gap) * 3} width={moduleSize} height={moduleSize} fill="#2f9e41" rx={radius} />

        <rect x={(moduleSize + gap) * 2} y="0" width={moduleSize} height={moduleSize} fill="#2f9e41" rx={radius} />
        <rect x={(moduleSize + gap) * 2} y={(moduleSize + gap) * 2} width={moduleSize} height={moduleSize} fill="#2f9e41" rx={radius} />
      </g>

      <g className="ifam-logo-lettering" transform="translate(104, 20)">
        <text x="0" y="22" className="ifam-logo-title-line">INSTITUTO</text>
        <text x="0" y="46" className="ifam-logo-title-line">FEDERAL</text>
        <text x="0" y="68" className="ifam-logo-institute">Amazonas</text>
        <line x1="0" y1="80" x2="178" y2="80" className="ifam-logo-divider" />
        <text x="0" y="102" className="ifam-logo-campus">Campus Manaus Zona Leste</text>
      </g>
    </svg>
  )
}

export default function AgendamentoBancaPage() {
  const [form, setForm] = useState(initialForm)
  const [agendamentos, setAgendamentos] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [listError, setListError] = useState('')
  const [listSuccess, setListSuccess] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)

  // Estados extras de UI
  const [toasts, setToasts] = useState([])
  const [helpOpen, setHelpOpen] = useState(false)
  const [localOption, setLocalOption] = useState('Sala 301')
  const toastIdRef = useRef(0)

  // Estados para busca e filtragem
  const [filterTema, setFilterTema] = useState('')
  const [filterDataInicio, setFilterDataInicio] = useState('')
  const [filterDataFim, setFilterDataFim] = useState('')

  const minInicio = useMemo(() => getLocalISOString(), [])

  // Auxiliar para adicionar Toasts
  const addToast = (message, type = 'success') => {
    toastIdRef.current += 1
    const id = toastIdRef.current
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  function handleLocalOptionChange(event) {
    const nextLocalOption = event.target.value
    setLocalOption(nextLocalOption)
    setForm((current) => ({
      ...current,
      local_ou_link: nextLocalOption === 'custom' ? '' : nextLocalOption,
    }))
  }

  // Estatísticas do portal
  const stats = useMemo(() => {
    const total = agendamentos.length
    const now = new Date()
    const futureAgendamentos = agendamentos
      .filter((item) => new Date(item.data_hora_inicio) > now)
      .sort((a, b) => new Date(a.data_hora_inicio) - new Date(b.data_hora_inicio))
    
    const proximaBanca = futureAgendamentos.length > 0 
      ? formatDateTime(futureAgendamentos[0].data_hora_inicio)
      : 'Nenhuma agendada'
      
    let presencial = 0
    let online = 0
    agendamentos.forEach((item) => {
      const loc = item.local_ou_link.toLowerCase()
      if (loc.includes('sala')) {
        presencial++
      } else if (loc.startsWith('http') || loc.includes('meet') || loc.includes('zoom') || loc.includes('link')) {
        online++
      } else {
        presencial++
      }
    })
    
    return { total, proximaBanca, presencial, online }
  }, [agendamentos])

  // Validação em tempo real: avisar se a data final <= data inicial
  const showDateWarning = useMemo(() => {
    return form.data_hora_inicio && form.data_hora_fim && new Date(form.data_hora_fim) <= new Date(form.data_hora_inicio)
  }, [form.data_hora_inicio, form.data_hora_fim])

  // Validação em tempo real: detectar conflito local de sala na listagem
  const localConflict = useMemo(() => {
    if (!form.data_hora_inicio || !form.data_hora_fim || !form.local_ou_link) return null
    const start = new Date(form.data_hora_inicio)
    const end = new Date(form.data_hora_fim)
    if (end <= start) return null
    
    const overlap = agendamentos.find((item) => {
      const itemStart = new Date(item.data_hora_inicio)
      const itemEnd = new Date(item.data_hora_fim)
      const sameLocal = item.local_ou_link.trim().toLowerCase() === form.local_ou_link.trim().toLowerCase()
      return sameLocal && itemStart < end && itemEnd > start
    })
    return overlap || null
  }, [form.data_hora_inicio, form.data_hora_fim, form.local_ou_link, agendamentos])

  // Identifica todos os conflitos gerais da tabela (bancas sobrepostas)
  const conflictsSet = useMemo(() => {
    const conflicts = new Set()
    for (let i = 0; i < agendamentos.length; i++) {
      for (let j = i + 1; j < agendamentos.length; j++) {
        const a = agendamentos[i]
        const b = agendamentos[j]
        if (a.local_ou_link.trim().toLowerCase() === b.local_ou_link.trim().toLowerCase()) {
          const aStart = new Date(a.data_hora_inicio)
          const aEnd = new Date(a.data_hora_fim)
          const bStart = new Date(b.data_hora_inicio)
          const bEnd = new Date(b.data_hora_fim)
          if (aStart < bEnd && bStart < aEnd) {
            conflicts.add(a.id)
            conflicts.add(b.id)
          }
        }
      }
    }
    return conflicts
  }, [agendamentos])

  const sortedAgendamentos = useMemo(() => {
    return [...agendamentos].sort(
      (a, b) => new Date(a.data_hora_inicio) - new Date(b.data_hora_inicio),
    )
  }, [agendamentos])

  const filteredAgendamentos = useMemo(() => {
    return sortedAgendamentos.filter((item) => {
      // Filtrar por tema ou local (busca por texto parcial, case-insensitive)
      if (filterTema) {
        const query = filterTema.toLowerCase()
        const matchTema = item.tema_tcc_id && String(item.tema_tcc_id).toLowerCase().includes(query)
        const matchLocal = item.local_ou_link && String(item.local_ou_link).toLowerCase().includes(query)
        if (!matchTema && !matchLocal) return false
      }

      // Filtrar por período inicial
      if (filterDataInicio) {
        const startLimit = new Date(filterDataInicio)
        const itemStart = new Date(item.data_hora_inicio)
        if (itemStart < startLimit) return false
      }

      // Filtrar por período final
      if (filterDataFim) {
        const endLimit = new Date(filterDataFim)
        const itemStart = new Date(item.data_hora_inicio)
        if (itemStart > endLimit) return false
      }

      return true
    })
  }, [sortedAgendamentos, filterTema, filterDataInicio, filterDataFim])

  async function carregarAgendamentos() {
    setLoading(true)
    setListError('')

    try {
      const data = await listarAgendamentos()
      setAgendamentos(Array.isArray(data) ? data : data.results || [])
    } catch (err) {
      setListError(getApiError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Carrega dados assincronamente para evitar chamadas síncronas de setState no corpo do effect
    Promise.resolve().then(() => {
      carregarAgendamentos()
    })
  }, [])

  useEffect(() => {
    if (formSuccess) {
      const t = setTimeout(() => setFormSuccess(''), 4000)
      return () => clearTimeout(t)
    }
  }, [formSuccess])

  useEffect(() => {
    if (listSuccess) {
      const t = setTimeout(() => setListSuccess(''), 4000)
      return () => clearTimeout(t)
    }
  }, [listSuccess])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  // Atalhos Rápidos de data
  const handleQuickDate = (type) => {
    const start = new Date()
    start.setMinutes(0, 0, 0)
    if (type === 'hoje') {
      start.setHours(start.getHours() + 1)
    } else if (type === 'amanha') {
      start.setDate(start.getDate() + 1)
      start.setHours(14)
    } else if (type === 'proxima-semana') {
      const day = start.getDay()
      const daysToAdd = day === 0 ? 1 : 8 - day
      start.setDate(start.getDate() + daysToAdd)
      start.setHours(14)
    }
    const end = new Date(start.getTime() + 60 * 60 * 1000) // 1 hora de duração
    setForm((current) => ({
      ...current,
      data_hora_inicio: getLocalISOString(start),
      data_hora_fim: getLocalISOString(end),
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setFormError('')
    setFormSuccess('')

    if (new Date(form.data_hora_inicio) >= new Date(form.data_hora_fim)) {
      setFormError('A data de fim deve ser posterior à data de início.')
      addToast('A data de fim deve ser posterior à data de início.', 'error')
      setSaving(false)
      return
    }

    // Validação preventiva: impede envio caso o UUID do tema já tenha banca cadastrada na listagem local
    const jaAgendado = agendamentos.some(
      (item) => String(item.tema_tcc_id).trim().toLowerCase() === String(form.tema_tcc_id).trim().toLowerCase()
    )
    if (jaAgendado) {
      setFormError('Este tema de TCC já possui uma banca agendada. Cada tema só pode ter uma única banca.')
      addToast('Este tema de TCC já possui uma banca agendada.', 'error')
      setSaving(false)
      return
    }

    try {
      await criarAgendamento({
        ...form,
        data_hora_inicio: new Date(form.data_hora_inicio).toISOString(),
        data_hora_fim: new Date(form.data_hora_fim).toISOString(),
      })
      setForm(initialForm)
      setLocalOption('Sala 301')
      setFormSuccess('Banca agendada com sucesso.')
      addToast('Banca agendada com sucesso.', 'success')
      await carregarAgendamentos()
    } catch (err) {
      const errMsg = getApiError(err)
      setFormError(errMsg)
      addToast(errMsg, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleCancel(id) {
    setListError('')
    setListSuccess('')
    setCancellingId(id)

    try {
      await cancelarAgendamento(id)
      setListSuccess('Agendamento cancelado.')
      addToast('Agendamento cancelado.', 'success')
      setConfirmDeleteId(null)
      await carregarAgendamentos()
    } catch (err) {
      const errMsg = getApiError(err)
      setListError(errMsg)
      addToast(errMsg, 'error')
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className="agendamento-page">
      {/* Cabeçalho Institucional IFAM */}
      <header className="ifam-header">
        <div className="ifam-header-top">
          <div className="ifam-logo-container">
            <InstitutoFederalLogo />
          </div>
          
          <div className="ifam-system-title">
            <span className="ifam-badge">Portal do Aluno</span>
            <h2>Sistema de Gestão de TCC</h2>
          </div>
        </div>

        <nav className="ifam-nav">
          <div className="ifam-nav-content">
            <span role="link" aria-disabled="true" className="ifam-nav-link ifam-nav-disabled" title="Funcionalidade em desenvolvimento">Início</span>
            <span role="link" aria-disabled="true" className="ifam-nav-link ifam-nav-disabled" title="Funcionalidade em desenvolvimento">Temas TCC</span>
            <a href="#bancas" className="ifam-nav-link active">Agendamento de Bancas</a>
            <span role="link" aria-disabled="true" className="ifam-nav-link ifam-nav-disabled" title="Funcionalidade em desenvolvimento">Relatórios</span>
          </div>
        </nav>
      </header>

      {/* Caminho de Navegação (Breadcrumbs) */}
      <div className="ifam-breadcrumbs-container">
        <div className="ifam-breadcrumbs">
          <span className="label-voce">Você está aqui: </span>
          <span role="link" aria-disabled="true" className="crumb-link" style={{ cursor: 'default', textDecoration: 'none' }} title="Funcionalidade em desenvolvimento">Início</span>
          <span className="separator" aria-hidden="true">/</span>
          <a href="#bancas" className="crumb-link">Bancas</a>
          <span className="separator" aria-hidden="true">/</span>
          <span className="current">Agendamento</span>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="agendamento-shell">
        <header className="agendamento-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>
              Agendamento de Bancas
              <button 
                type="button" 
                className="help-trigger-btn" 
                onClick={() => setHelpOpen(true)}
                title="Como agendar uma banca"
                aria-label="Ajuda e orientações"
              >
                ?
              </button>
            </h1>
            <p className="agendamento-subtitle">
              Gestão acadêmica de defesas — cadastre horários, local ou link e acompanhe as
              bancas agendadas.
            </p>
          </div>
        </header>

        {/* Cards de Estatísticas */}
        <section className="agendamento-stats-grid">
          <div className="agendamento-stat-card total">
            <span className="stat-icon" style={{ display: 'flex', alignItems: 'center' }}>
              <svg className="stat-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
              </svg>
            </span>
            <div className="stat-info">
              <span className="stat-label">Total de Bancas</span>
              <span className="stat-value">{stats.total} {stats.total === 1 ? 'Banca' : 'Bancas'}</span>
              <span className="stat-subtext">agendadas no sistema</span>
            </div>
          </div>
          <div className="agendamento-stat-card proxima">
            <span className="stat-icon" style={{ display: 'flex', alignItems: 'center' }}>
              <svg className="stat-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </span>
            <div className="stat-info">
              <span className="stat-label">Próxima Defesa</span>
              <span className="stat-value">{stats.proximaBanca}</span>
              <span className="stat-subtext">próximo compromisso</span>
            </div>
          </div>
          <div className="agendamento-stat-card distribu">
            <span className="stat-icon" style={{ display: 'flex', alignItems: 'center' }}>
              <svg className="stat-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </span>
            <div className="stat-info">
              <span className="stat-label">Distribuição</span>
              <span className="stat-value">
                {stats.presencial} {stats.presencial === 1 ? 'Presencial' : 'Presenciais'}
              </span>
              <span className="stat-subtext">
                {stats.online} Online
              </span>
            </div>
          </div>
        </section>

        <section className="agendamento-grid">
          <form className="agendamento-form" onSubmit={handleSubmit}>
            <div className="agendamento-form-head">
              <h2>Novo agendamento</h2>
              <p>Preencha os dados para registrar a banca de defesa.</p>
            </div>

            <div className="agendamento-form-fields">
              <label htmlFor="tema-tcc-input">
                ID do Tema de TCC
                <input
                  id="tema-tcc-input"
                  name="tema_tcc_id"
                  value={form.tema_tcc_id}
                  onChange={handleChange}
                  placeholder="UUID do tema ou ID do TCC"
                  required
                  aria-describedby="tema-tcc-help"
                />
                <small id="tema-tcc-help" className="form-help-text">
                  Informe o ID numérico ou UUID do tema já cadastrado no sistema.
                </small>
              </label>

              <div className="agendamento-inline">
                <label>
                  Início
                  <input
                    name="data_hora_inicio"
                    type="datetime-local"
                    value={form.data_hora_inicio}
                    onChange={handleChange}
                    min={minInicio}
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
                    min={form.data_hora_inicio || minInicio}
                    required
                  />
                </label>
              </div>

              <div className="quick-options-container" style={{ marginTop: '-10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 'bold', color: 'var(--texto-secundario)' }}>Definir data: </span>
                <button type="button" className="quick-btn" onClick={() => handleQuickDate('hoje')}>Hoje (breve)</button>
                <button type="button" className="quick-btn" onClick={() => handleQuickDate('amanha')}>Amanhã</button>
                <button type="button" className="quick-btn" onClick={() => handleQuickDate('proxima-semana')}>Próxima Semana</button>
              </div>

              {showDateWarning && (
                <div className="realtime-error">
                  <svg className="warning-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <span>A data final deve ser posterior à data de início.</span>
                </div>
              )}

              <label htmlFor="local-select">
                Local ou link
              </label>
              <select
                id="local-select"
                value={localOption}
                onChange={handleLocalOptionChange}
              >
                <option value="Sala 301">Sala 301</option>
                <option value="Sala 302">Sala 302</option>
                <option value="Google Meet">Google Meet</option>
                <option value="custom">Outro local ou link...</option>
              </select>

              {localOption === 'custom' && (
                <input
                  name="local_ou_link"
                  value={form.local_ou_link}
                  onChange={handleChange}
                  placeholder="Digite a sala ou link do Google Meet"
                  required
                  style={{ marginTop: '-8px' }}
                />
              )}

              {localConflict && (
                <div className="realtime-warning">
                  <svg className="warning-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <span>Atenção: Já existe banca agendada neste local/link com horário sobreposto.</span>
                </div>
              )}

              {formError && <p className="agendamento-alert error" role="alert">{formError}</p>}
              {formSuccess && <p className="agendamento-alert success" role="status">{formSuccess}</p>}

              <button className="agendamento-primary" type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <span className="spinner" />
                    Agendando...
                  </>
                ) : 'Agendar banca'}
              </button>
            </div>
          </form>

          <section className="agendamento-list" aria-live="polite">
            <div className="agendamento-list-header">
              <h2>Bancas agendadas</h2>
              <button type="button" onClick={carregarAgendamentos} disabled={loading}>
                {loading ? 'Atualizando...' : 'Atualizar'}
              </button>
            </div>

            {/* Painel de Busca e Filtros */}
            <div className="agendamento-filter-panel">
              <div className="filter-field filter-field-text">
                <label htmlFor="filter-tema-input">Buscar banca (Tema/Local)</label>
                <div className="filter-input-with-icon">
                  <input
                    id="filter-tema-input"
                    type="text"
                    placeholder="Digite tema, link ou sala..."
                    value={filterTema}
                    onChange={(e) => setFilterTema(e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-field filter-field-date">
                <label htmlFor="filter-inicio-input">Período (Início)</label>
                <input
                  id="filter-inicio-input"
                  type="datetime-local"
                  value={filterDataInicio}
                  onChange={(e) => setFilterDataInicio(e.target.value)}
                />
              </div>

              <div className="filter-field filter-field-date">
                <label htmlFor="filter-fim-input">Período (Fim)</label>
                <input
                  id="filter-fim-input"
                  type="datetime-local"
                  value={filterDataFim}
                  onChange={(e) => setFilterDataFim(e.target.value)}
                />
              </div>

              {(filterTema || filterDataInicio || filterDataFim) && (
                <button
                  type="button"
                  className="agendamento-clear-filters"
                  aria-label="Limpar todos os filtros de busca"
                  onClick={() => {
                    setFilterTema('')
                    setFilterDataInicio('')
                    setFilterDataFim('')
                  }}
                >
                  Limpar
                </button>
              )}
            </div>

            {(filterTema || filterDataInicio || filterDataFim) && filteredAgendamentos.length > 0 && (
              <p className="agendamento-filter-count">
                Mostrando {filteredAgendamentos.length} de {sortedAgendamentos.length} {filteredAgendamentos.length === 1 ? 'banca' : 'bancas'}
              </p>
            )}

            {listError && <p className="agendamento-alert error" role="alert" style={{ margin: '16px 24px 0' }}>{listError}</p>}
            {listSuccess && <p className="agendamento-alert success" role="status" style={{ margin: '16px 24px 0' }}>{listSuccess}</p>}

            {loading && agendamentos.length === 0 ? (
              <div className="agendamento-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Tema</th>
                      <th>Início</th>
                      <th>Fim</th>
                      <th>Local / Link</th>
                      <th aria-label="Ações" />
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map((i) => (
                      <tr key={`skeleton-${i}`}>
                        <td><div className="skeleton-cell" /></td>
                        <td><div className="skeleton-cell" /></td>
                        <td><div className="skeleton-cell" /></td>
                        <td><div className="skeleton-cell" /></td>
                        <td><div className="skeleton-cell" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : sortedAgendamentos.length === 0 ? (
              <p className="agendamento-empty">Nenhuma banca agendada.</p>
            ) : (
              <>
                {filteredAgendamentos.length === 0 ? (
                  <p className="agendamento-empty">Nenhum agendamento encontrado para os filtros selecionados.</p>
                ) : (
                  <div className="agendamento-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Tema</th>
                          <th>Início</th>
                          <th>Fim</th>
                          <th>Local / Link</th>
                          <th aria-label="Ações" />
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAgendamentos.map((item) => {
                          const isPresencial = item.local_ou_link.toLowerCase().includes('sala');
                          const isOnline = item.local_ou_link.toLowerCase().startsWith('http') || item.local_ou_link.toLowerCase().includes('meet') || item.local_ou_link.toLowerCase().includes('zoom');
                          const isHoje = new Date(item.data_hora_inicio).toDateString() === new Date().toDateString();
                          const isConflict = conflictsSet.has(item.id);

                          return (
                            <tr key={item.id}>
                              <td>{item.tema_tcc_id}</td>
                              <td>{formatDateTime(item.data_hora_inicio)}</td>
                              <td>{formatDateTime(item.data_hora_fim)}</td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                                  {item.local_ou_link.startsWith('http') ? (
                                    <a href={item.local_ou_link} target="_blank" rel="noopener noreferrer" className="ifam-link-externo">
                                      Acessar link
                                    </a>
                                  ) : (
                                    <span>{item.local_ou_link}</span>
                                  )}
                                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                                    {isPresencial && (
                                      <span className="banca-badge presencial">
                                        <span className="badge-dot"></span> Presencial
                                      </span>
                                    )}
                                    {isOnline && (
                                      <span className="banca-badge online">
                                        <span className="badge-dot"></span> Online
                                      </span>
                                    )}
                                    {isHoje && (
                                      <span className="banca-badge hoje">
                                        <span className="badge-dot"></span> Hoje
                                      </span>
                                    )}
                                    {isConflict && (
                                      <span className="banca-badge conflito" title="Sobreposição de horário e local com outra defesa">
                                        <span className="badge-dot"></span> Conflito
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td>
                                {confirmDeleteId === item.id ? (
                                  <div className="agendamento-confirm-group">
                                    <button
                                      className="agendamento-danger agendamento-confirm-btn"
                                      type="button"
                                      disabled={cancellingId === item.id}
                                      onClick={() => handleCancel(item.id)}
                                    >
                                      {cancellingId === item.id ? (
                                        <>
                                          <span className="spinner" />
                                          Confirmando...
                                        </>
                                      ) : 'Confirmar'}
                                    </button>
                                    <button
                                      className="agendamento-secondary agendamento-cancel-btn"
                                      type="button"
                                      disabled={cancellingId === item.id}
                                      onClick={() => setConfirmDeleteId(null)}
                                    >
                                      Desistir
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    className="agendamento-danger"
                                    type="button"
                                    onClick={() => setConfirmDeleteId(item.id)}
                                  >
                                    Cancelar
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </section>
        </section>
      </main>

      {/* Modal de Ajuda */}
      {helpOpen && (
        <div className="agendamento-modal-overlay" onClick={() => setHelpOpen(false)}>
          <div className="agendamento-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="agendamento-modal-header">
              <h3>Como agendar uma banca</h3>
              <button className="agendamento-modal-close" onClick={() => setHelpOpen(false)}>×</button>
            </div>
            <div className="agendamento-modal-body">
              <p>Siga o passo a passo abaixo para registrar um agendamento de banca de TCC:</p>
              <ol>
                <li><strong>Informe o ID do Tema:</strong> Insira o UUID correspondente ao tema do TCC. O tema deve estar previamente cadastrado e possuir parecer favorável do orientador.</li>
                <li><strong>Selecione o Horário:</strong> Escolha a data/hora de início e de término. Use os atalhos rápidos (Hoje, Amanhã, Próxima Semana) para facilitar o preenchimento.</li>
                <li><strong>Defina o Local ou Link:</strong> Escolha uma das salas físicas (Sala 301, Sala 302), link do Google Meet ou selecione "Outro" para digitar uma descrição customizada.</li>
                <li><strong>Evite Conflitos:</strong> O sistema validará em tempo real se a sala escolhida já está ocupada no horário selecionado. Caso esteja, altere a sala ou o horário.</li>
                <li><strong>Finalize:</strong> Clique em "Agendar banca". Você receberá uma notificação de sucesso e o agendamento aparecerá na tabela.</li>
              </ol>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '18px', marginBottom: '8px', color: 'var(--verde-principal)' }}>
                <svg className="warning-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <h4 style={{ margin: 0 }}>Regras Importantes</h4>
              </div>
              <ul>
                <li>A data final deve ser obrigatoriamente posterior à data inicial.</li>
                <li>O tema informado deve ter parecer favorável de aptidão para defesa registrado pelo orientador.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Notificações Toasts */}
      <div className="agendamento-toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-item ${t.type}`}>
            <span className="toast-icon" style={{ display: 'flex', alignItems: 'center' }}>
              {t.type === 'success' ? (
                <svg className="toast-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <svg className="toast-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              )}
            </span>
            <div className="toast-content">{t.message}</div>
            <button className="toast-close" onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}>×</button>
          </div>
        ))}
      </div>

      {/* Rodapé Institucional */}
      <footer className="ifam-footer">
        <div className="ifam-footer-content">
          <div className="ifam-footer-brand">
            <h4>INSTITUTO FEDERAL DO AMAZONAS</h4>
            <p>Sistema de Gestão de Trabalhos de Conclusão de Curso (TCC)</p>
            <p className="academic-purpose">Desenvolvido como módulo integrante da plataforma de controle acadêmico.</p>
          </div>
          <div className="ifam-footer-contacts">
            <h5>Contato & Suporte</h5>
            <p><strong>E-mail:</strong> suporte.tcc@ifam.edu.br</p>
            <p><strong>Telefone:</strong> (92) 3621-6700</p>
            <p><strong>Atendimento:</strong> Seg a Sex, 08:00 às 18:00</p>
          </div>
          <div className="ifam-footer-info">
            <h5>Informações</h5>
            <p>Av. Sete de Setembro, 1975 - Centro</p>
            <p>Manaus - AM | CEP: 69020-120</p>
            <p className="links-rodape">
              <a href="#ajuda">Ajuda</a> &bull; <a href="#privacidade">Privacidade</a>
            </p>
          </div>
        </div>
        <div className="ifam-footer-bottom">
          <p>&copy; {new Date().getFullYear()} Instituto Federal do Amazonas. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
