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

  // Estados para busca e filtragem
  const [filterTema, setFilterTema] = useState('')
  const [filterDataInicio, setFilterDataInicio] = useState('')
  const [filterDataFim, setFilterDataFim] = useState('')

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
    // Carrega dados assincronamente para evitar chamadas síncronas de setState no corpo do effect
    Promise.resolve().then(() => {
      carregarAgendamentos()
    })
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
    <div className="agendamento-page">
      {/* Cabeçalho Institucional IFAM */}
      <header className="ifam-header">
        <div className="ifam-header-top">
          <div className="ifam-logo-container">
            <svg viewBox="0 0 200 230" width="115" height="132" className="ifam-logo-svg">
              <g transform="translate(66, 10)">
                {/* Coluna 1 (i) */}
                {/* Círculo vermelho: dimensão 10% maior que o quadrado x (20px). Logo, diâmetro=22, raio=11. Centrado em cx=10, cy=10 */}
                <circle cx="10" cy="10" r="11" fill="#cd191e" />
                <rect x="0" y="24" width="20" height="20" fill="#2f9e41" rx="2" />
                <rect x="0" y="48" width="20" height="20" fill="#2f9e41" rx="2" />
                <rect x="0" y="72" width="20" height="20" fill="#2f9e41" rx="2" />
                
                {/* Coluna 2 (f-haste) - Posição x = 24 (Col 1 + gap = 20 + 4 = 24) */}
                <rect x="24" y="0" width="20" height="20" fill="#2f9e41" rx="2" />
                <rect x="24" y="24" width="20" height="20" fill="#2f9e41" rx="2" />
                <rect x="24" y="48" width="20" height="20" fill="#2f9e41" rx="2" />
                <rect x="24" y="72" width="20" height="20" fill="#2f9e41" rx="2" />
                
                {/* Coluna 3 (f-barras) - Posição x = 48 (Col 2 + gap = 24 + 4 + 20 = 48) */}
                {/* O manual de marca mostra a barra de cima na linha 1 (y=0) e a do meio na linha 3 (y=48) */}
                <rect x="48" y="0" width="20" height="20" fill="#2f9e41" rx="2" />
                <rect x="48" y="48" width="20" height="20" fill="#2f9e41" rx="2" />
              </g>
              
              {/* Assinatura vertical centralizada */}
              <text x="100" y="122" fontFamily="'Open Sans', sans-serif" fontSize="16" fontWeight="800" fill="#000000" textAnchor="middle" letterSpacing="-0.02em">INSTITUTO</text>
              <text x="100" y="142" fontFamily="'Open Sans', sans-serif" fontSize="16" fontWeight="800" fill="#000000" textAnchor="middle" letterSpacing="-0.02em">FEDERAL</text>
              <text x="100" y="160" fontFamily="'Open Sans', sans-serif" fontSize="13" fontWeight="600" fill="#000000" textAnchor="middle">Amazonas</text>
              
              {/* Linha divisória verde */}
              <line x1="50" y1="172" x2="150" y2="172" stroke="#2f9e41" strokeWidth="1.5" />
              
              <text x="100" y="190" fontFamily="'Open Sans', sans-serif" fontSize="12" fontWeight="400" fill="#000000" textAnchor="middle">Campus</text>
              <text x="100" y="208" fontFamily="'Open Sans', sans-serif" fontSize="12" fontWeight="700" fill="#000000" textAnchor="middle">Manaus Zona Leste</text>
            </svg>
          </div>
          
          <div className="ifam-system-title">
            <span className="ifam-badge">Portal do Aluno</span>
            <h2>Sistema de Gestão de TCC</h2>
          </div>
        </div>

        <nav className="ifam-nav">
          <div className="ifam-nav-content">
            <a href="#inicio" className="ifam-nav-link">Início</a>
            <a href="#temas" className="ifam-nav-link">Temas TCC</a>
            <a href="#bancas" className="ifam-nav-link active">Agendamento de Bancas</a>
            <a href="#relatorios" className="ifam-nav-link">Relatórios</a>
          </div>
        </nav>
      </header>

      {/* Caminho de Navegação (Breadcrumbs) */}
      <div className="ifam-breadcrumbs-container">
        <div className="ifam-breadcrumbs">
          <span className="label-voce">Você está aqui: </span>
          <a href="#inicio" className="crumb-link">Início</a>
          <span className="separator">/</span>
          <a href="#bancas" className="crumb-link">Bancas</a>
          <span className="separator">/</span>
          <span className="current">Agendamento</span>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="agendamento-shell">
        <header className="agendamento-header">
          <h1>Agendamento de Bancas</h1>
          <p className="agendamento-subtitle">
            Gestão acadêmica de defesas — cadastre horários, local ou link e acompanhe as
            bancas agendadas.
          </p>
        </header>

        <section className="agendamento-grid">
          <form className="agendamento-form" onSubmit={handleSubmit}>
            <div className="agendamento-form-head">
              <h2>Novo agendamento</h2>
              <p>Preencha os dados para registrar a banca de defesa.</p>
            </div>

            <div className="agendamento-form-fields">
              <label>
                Tema TCC (ID)
                <input
                  name="tema_tcc_id"
                  value={form.tema_tcc_id}
                  onChange={handleChange}
                  placeholder="UUID do tema ou ID do TCC"
                  required
                />
              </label>

              <div className="agendamento-inline">
                <label>
                  Início
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
                  placeholder="Ex: Sala 302 ou link Google Meet"
                  required
                />
              </label>

              {error && <p className="agendamento-alert error">{error}</p>}
              {success && <p className="agendamento-alert success">{success}</p>}

              <button className="agendamento-primary" type="submit" disabled={saving}>
                {saving ? 'Agendando...' : 'Agendar banca'}
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
                <label htmlFor="filter-tema-input">Buscar por tema ou local</label>
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
                <label htmlFor="filter-inicio-input">Período de início</label>
                <input
                  id="filter-inicio-input"
                  type="datetime-local"
                  value={filterDataInicio}
                  onChange={(e) => setFilterDataInicio(e.target.value)}
                />
              </div>

              <div className="filter-field filter-field-date">
                <label htmlFor="filter-fim-input">Período até</label>
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

            {sortedAgendamentos.length === 0 && !loading ? (
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
                        {filteredAgendamentos.map((item) => (
                          <tr key={item.id}>
                            <td>{item.tema_tcc_id}</td>
                            <td>{formatDateTime(item.data_hora_inicio)}</td>
                            <td>{formatDateTime(item.data_hora_fim)}</td>
                            <td>
                              {item.local_ou_link.startsWith('http') ? (
                                <a href={item.local_ou_link} target="_blank" rel="noopener noreferrer" className="ifam-link-externo">
                                  Acessar link
                                </a>
                              ) : (
                                item.local_ou_link
                              )}
                            </td>
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
              </>
            )}
          </section>
        </section>
      </main>

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
