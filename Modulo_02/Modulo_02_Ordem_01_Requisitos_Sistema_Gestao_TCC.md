# Especificação Técnica - Módulo 2: Sistema de Gestão de TCC e Bancas

Este documento detalha os Requisitos Funcionais (RF-13 ao RF-25) do **Módulo 2: Sistema de Gestão de TCC e Bancas**, projetado para ser executado como uma fatia vertical completa (Front-end no ecossistema React e Back-end em Django REST Framework com PostgreSQL).

---

## [RF-13] Autenticação e Cadastro de Alunos
* **Responsável:** Aluno 13
* **Objetivo:** Permitir o auto-cadastro de estudantes no sistema e gerenciar a autenticação segura baseada em JWT.
* **Regras de Negócio:**
    1. A matrícula do aluno deve ser validada como única no banco de dados.
    2. O auto-cadastro atribui automaticamente o perfil "Aluno" ao usuário.
    3. As senhas devem ser criptografadas via hash seguro.
* **Relacionamentos:** Entidade base para as interações dos alunos no sistema.

### Dicionário de Dados: Tabela `Aluno`
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único universal do aluno. |
| `nome_completo` | VARCHAR(150) | NOT NULL | Nome civil completo do estudante. |
| `matricula` | VARCHAR(20) | UNIQUE, NOT NULL | Registro de matrícula da instituição. |
| `email` | VARCHAR(100) | UNIQUE, NOT NULL | E-mail para acesso (login). |
| `senha_hash` | VARCHAR(255) | NOT NULL | Hash da senha. |
| `curso` | VARCHAR(100) | NOT NULL | Curso no qual o aluno está matriculado. |

---

## [RF-14] Cadastro e Gestão de Temas de TCC
* **Responsável:** Aluno 14
* **Objetivo:** Interface para o aluno submeter a proposta inicial do tema de seu trabalho para aprovação da coordenação.
* **Regras de Negócio:**
    1. Um aluno só pode tener um tema com status "Aprovado" ou "Pendente" ativo por vez.
    2. A coordenação avalia a proposta e muda o status para "Aprovado" ou "Rejeitado".
* **Relacionamentos:** Um `Aluno` pode submeter um ou mais `TemaTcc` (caso seja reprovado e tente de novo).

### Dicionário de Dados: Tabela `TemaTcc`
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único da proposta de TCC. |
| `aluno_id` | UUID | FK, NOT NULL | Chave estrangeira vinculando ao `Aluno`. |
| `titulo` | VARCHAR(255) | NOT NULL | Título proposto para a pesquisa. |
| `resumo` | TEXT | NOT NULL | Breve descrição ou abstract da ideia. |
| `status` | VARCHAR(30) | DEFAULT 'Pendente'| Valores: 'Pendente', 'Aprovado', 'Rejeitado'. |
| `data_submissao` | TIMESTAMP | DEFAULT NOW() | Data do envio da proposta. |

---

## [RF-15] Vinculação de Orientador e Aluno
* **Responsável:** Aluno 15
* **Objetivo:** Gerenciar o convite e aceitação de orientação entre alunos e docentes.
* **Regras de Negócio:**
    1. O aluno só pode enviar convite de orientação se seu tema estiver "Aprovado".
    2. O professor (Docente) não pode exceder um limite configurável (ex: 5) de orientandos simultâneos.
    3. O professor pode "Aceitar" ou "Recusar" o convite via painel.
* **Relacionamentos:** Tabela associativa entre `TemaTcc` e `Docente`.

### Dicionário de Dados: Tabela `VinculoOrientacao`
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único do vínculo. |
| `tema_tcc_id` | UUID | FK, UNIQUE | A proposta de TCC vinculada. |
| `docente_id` | UUID | FK, NOT NULL | O professor interno solicitado. |
| `status` | VARCHAR(30) | DEFAULT 'Pendente'| Valores: 'Pendente', 'Aceito', 'Recusado'. |
| `data_resposta` | TIMESTAMP | NULL | Data em que o professor respondeu ao convite. |

---

## [RF-16] Linha do Tempo e Entregas (Milestones)
* **Responsável:** Aluno 16
* **Objetivo:** Definir e acompanhar os prazos obrigatórios do semestre para as etapas do TCC.
* **Regras de Negócio:**
    1. Apenas usuários com perfil da Coordenação podem cadastrar os prazos.
    2. O sistema deve validar se a `data_fim` de uma fase é posterior à `data_inicio`.
* **Relacionamentos:** Funciona como um cronograma global; entregas do aluno verificam estas datas.

### Dicionário de Dados: Tabela `CronogramaFase`
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único da fase do cronograma. |
| `titulo` | VARCHAR(100) | NOT NULL | Nome da etapa (ex: 'Envio da Qualificação'). |
| `data_inicio` | TIMESTAMP | NOT NULL | Data de abertura para submissão desta fase. |
| `data_fim` | TIMESTAMP | NOT NULL | Data limite (deadline) da fase. |
| `obrigatoria` | BOOLEAN | DEFAULT TRUE | Define se a fase bloqueia a defesa se não feita. |

---

## [RF-17] Repositório e Upload de Arquivos (Versões do TCC)
* **Responsável:** Aluno 17
* **Objetivo:** Permitir que o aluno envie versões de seu trabalho (arquivos em PDF/Word) ao longo do semestre.
* **Regras de Negócio:**
    1. O Back-end deve aceitar requisições de upload multipart/form-data e salvar a URL do arquivo.
    2. O número da versão deve incrementar automaticamente a cada novo envio.
* **Relacionamentos:** Uma proposta (`TemaTcc`) possui várias `VersaoTrabalho` (1:N).

### Dicionário de Dados: Tabela `VersaoTrabalho`
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único da submissão do arquivo. |
| `tema_tcc_id` | UUID | FK, NOT NULL | Chave estrangeira para a proposta/trabalho base. |
| `arquivo_url` | VARCHAR(255) | NOT NULL | Caminho ou URL de armazenamento do arquivo (S3/Local).|
| `versao` | INTEGER | NOT NULL | Número sequencial da versão submetida. |
| `data_envio` | TIMESTAMP | DEFAULT NOW() | Carimbo de data e hora do envio. |

---

## [RF-18] Módulo de Feedback e Parecer do Orientador
* **Responsável:** Aluno 18
* **Objetivo:** Interface para o orientador inserir comentários sobre as versões enviadas e emitir o parecer final de aptidão para a banca.
* **Regras de Negócio:**
    1. O orientador só pode emitir parecer para os trabalhos em que o `VinculoOrientacao` conste como 'Aceito'.
    2. Apenas a marcação do flag `apto_banca` como verdadeiro libera o agendamento da defesa.
* **Relacionamentos:** Uma `VersaoTrabalho` pode receber um `Parecer` (1:1).

### Dicionário de Dados: Tabela `ParecerOrientador`
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único do parecer. |
| `versao_id` | UUID | FK, UNIQUE | Versão específica avaliada. |
| `comentarios` | TEXT | NOT NULL | Observações textuais do orientador. |
| `apto_banca` | BOOLEAN | DEFAULT FALSE | Flag que autoriza o aluno a ir para a defesa. |
| `data_parecer` | TIMESTAMP | DEFAULT NOW() | Data da avaliação. |

---

## [RF-19] Agendamento de Bancas (Data, Hora e Local)
* **Responsável:** Aluno 19
* **Objetivo:** Agendar os dados físicos ou virtuais da sessão de defesa do TCC.
* **Regras de Negócio:**
    1. Bloqueio de agendamento: A data não pode conflitar com outra banca utilizando a mesma sala física no mesmo horário.
    2. Só é possível agendar bancas para alunos com parecer favorável (apto para a banca).
* **Relacionamentos:** Um `TemaTcc` possui um `AgendamentoBanca` (1:1).

### Dicionário de Dados: Tabela `AgendamentoBanca`
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único do agendamento. |
| `tema_tcc_id` | UUID | FK, UNIQUE | O trabalho que será defendido. |
| `data_hora_inicio`| TIMESTAMP | NOT NULL | Início da sessão. |
| `data_hora_fim` | TIMESTAMP | NOT NULL | Término previsto da sessão. |
| `local_ou_link` | VARCHAR(255) | NOT NULL | Sala física (ex: Sala 302) ou URL (Meet/Zoom). |

---

## [RF-20] Composição da Banca Examinadora
* **Responsável:** Aluno 20
* **Objetivo:** Adicionar os professores e convidados que irão compor a comissão avaliadora de uma banca agendada.
* **Regras de Negócio:**
    1. Uma banca deve ter, no mínimo, o orientador (como presidente) e mais dois avaliadores.
    2. Um mesmo avaliador não pode ser inserido duas vezes na mesma banca.
* **Relacionamentos:** Tabela associativa entre `AgendamentoBanca` e `Docente` (N:M).

### Dicionário de Dados: Tabela `MembroBanca`
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único da linha da comissão. |
| `agendamento_id`| UUID | FK, NOT NULL | A qual banca o membro foi alocado. |
| `docente_id` | UUID | FK, NOT NULL | O professor ou avaliador externo convocado. |
| `papel` | VARCHAR(50) | NOT NULL | Valores: 'Presidente', 'Avaliador Interno', 'Avaliador Externo'. |
| `confirmado` | BOOLEAN | DEFAULT FALSE | Flag se o membro confirmou presença. |

---

## [RF-21] Painel do Avaliador (Lançamento de Notas)
* **Responsável:** Aluno 21
* **Objetivo:** Tela exclusiva para cada membro da banca registrar suas avaliações sob critérios parametrizados.
* **Regras de Negócio:**
    1. As notas variam de 0 a 10.
    2. A API deverá calcular uma média aritmética simples ou ponderada entre as notas de apresentação e monografia escrita.
* **Relacionamentos:** Um `MembroBanca` submete uma `AvaliacaoNota` (1:1).

### Dicionário de Dados: Tabela `AvaliacaoNota`
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único da folha de nota. |
| `membro_banca_id`| UUID | FK, UNIQUE | Qual membro lançou esta avaliação. |
| `nota_escrita` | NUMERIC(4,2)| NOT NULL | Avaliação do documento entregue. |
| `nota_apresentacao`| NUMERIC(4,2)| NOT NULL | Avaliação da oratória/defesa. |
| `comentarios` | TEXT | NULL | Justificativa ou ressalvas da nota. |

---

## [RF-22] Geração Automatizada da Ata de Defesa
* **Responsável:** Aluno 22
* **Objetivo:** Consolidar as notas lançadas e gerar o termo de Ata de Defesa em formato exportável (PDF).
* **Regras de Negócio:**
    1. A ata só pode ser gerada se todos os membros da banca tiverem lançado a `AvaliacaoNota`.
    2. O Back-end calcula a média global do aluno. Se Média >= 7.0, status final é 'Aprovado'. Se menor, 'Reprovado'.
* **Relacionamentos:** Utiliza dados consolidados, lendo tabelas das etapas anteriores e gravando apenas o resultado final na tabela base.

### Dicionário de Dados: Tabela `AtaDefesa` (Consolidação)
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único da ata. |
| `agendamento_id`| UUID | FK, UNIQUE | Agendamento base que originou a ata. |
| `media_final` | NUMERIC(4,2)| NOT NULL | Média das notas de todos os membros. |
| `resultado` | VARCHAR(50) | NOT NULL | Valores: 'Aprovado', 'Aprovado com Ressalvas', 'Reprovado'. |
| `data_emissao` | TIMESTAMP | DEFAULT NOW() | Carimbo de fechamento da ata. |

---

## [RF-23] Gestão de Professores (Orientadores) e Avaliadores Externos
* **Responsável:** Aluno 23
* **Objetivo:** Banco de dados central unificado de docentes (para atuarem como orientadores ou membros de bancas).
* **Regras de Negócio:**
    1. O sistema deve diferenciar docentes da casa (Internos) de convidados (Externos).
    2. Professores internos devem ter as credenciais (e-mail) associadas a um sistema de login próprio.
* **Relacionamentos:** Base para `VinculoOrientacao` e `MembroBanca`.

### Dicionário de Dados: Tabela `Docente`
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único do docente. |
| `nome_completo` | VARCHAR(150) | NOT NULL | Nome do professor/avaliador. |
| `email` | VARCHAR(100) | UNIQUE, NOT NULL | Contato eletrônico. |
| `vinculo` | VARCHAR(30) | NOT NULL | Valores: 'Interno', 'Externo'. |
| `instituicao` | VARCHAR(150) | NULL | Caso externo, nome da Universidade/Empresa de origem. |
| `titulacao` | VARCHAR(50) | NOT NULL | Especialista, Mestre, Doutor, etc. |

---

## [RF-24] Dashboard de Acompanhamento (Visão Coordenação)
* **Responsável:** Aluno 24
* **Objetivo:** Fornecer à coordenação gráficos estatísticos do panorama das bancas e status de TCCs.
* **Regras de Negócio:**
    1. Sem criação de tabelas novas; consumo de agregadores via consultas SQL (ex: `COUNT`, `GROUP BY`).
    2. Payload da API (JSON) deve retornar quantitativos: TCCs pendentes de orientador, Bancas marcadas para o mês, Taxa de aprovação.

### Contrato de Dados Esperado (Payload JSON de Retorno da API)
```json
{
  "total_alunos_sem_tema": 12,
  "temas_aguardando_aprovacao": 5,
  "bancas_agendadas_mes": 8,
  "taxa_aprovacao_semestre": 92.5
}

## [RF-25] Sistema de Notificações por E-mail / Alertas
* **Responsável:** Aluno 25
* **Objetivo:** Criar um barramento de notificações para avisar os atores sobre pendências (ex: "Seu orientador avaliou seu TCC").
* **Regras de Negócio:**
    1. O Back-end deve disparar e-mails via SMTP do Django quando endpoints-gatilho forem acionados.
    2. O Front-end deve possuir um ícone de "sino" (Dropdown) listando as notificações lidas e não lidas do usuário logado.
* **Relacionamentos:** Uma `Notificacao` é ligada ao e-mail de destino (Aluno ou Docente).

### Dicionário de Dados: Tabela `Notificacao`
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único do alerta. |
| `destinatario_email`| VARCHAR(100) | NOT NULL | E-mail da conta de destino. |
| `titulo` | VARCHAR(100) | NOT NULL | Assunto curto da notificação. |
| `mensagem` | TEXT | NOT NULL | Corpo descritivo do alerta. |
| `lida` | BOOLEAN | DEFAULT FALSE | Flag para controle do sino na interface. |
| `data_envio` | TIMESTAMP | DEFAULT NOW() | Momento da execução/emissão do alerta. |