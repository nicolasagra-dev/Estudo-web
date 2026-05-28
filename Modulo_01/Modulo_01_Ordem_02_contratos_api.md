# Contratos de API (Payloads JSON) - Módulo 1

Este documento define os contratos de dados esperados (estruturas JSON de Envio/Request e Retorno/Response) para os principais endpoints dos Requisitos Funcionais do **Módulo 1: Sistema de Alocação de Recursos Didáticos**. 

As rotas seguem o padrão RESTful e as convenções do Django REST Framework (DRF).

---

## [RF-01] Autenticação e Controle de Acesso
**Endpoint:** `POST /api/auth/login/`

**Payload de Envio (Request):**
```json
{
  "email": "professor@instituicao.edu.br",
  "senha": "senha_super_segura_123"
}
```

**Payload de Retorno (Response) - Sucesso (200 OK):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "def456GHI789jkl012mno...",
  "usuario": {
    "id": "a1b2c3d4-e5f6-7890-1234-56789abcdef0",
    "email": "professor@instituicao.edu.br",
    "perfil": "Professor"
  }
}
```

---

## [RF-02] Gestão de Professores
**Endpoint:** `POST /api/professores/` (Criação)

**Payload de Envio (Request):**
```json
{
  "nome_completo": "Carlos Roberto da Silva",
  "matricula": "202300154",
  "departamento": "Departamento de Computação",
  "email": "carlos.silva@instituicao.edu.br",
  "senha": "senha_temporaria_123"
}
```

**Payload de Retorno (Response) - Sucesso (201 Created):**
```json
{
  "id": "b2c3d4e5-f6a7-8901-2345-6789abcdef01",
  "nome_completo": "Carlos Roberto da Silva",
  "matricula": "202300154",
  "departamento": "Departamento de Computação",
  "usuario_id": "c3d4e5f6-a7b8-9012-3456-789abcdef012",
  "ativo": true
}
```

---

## [RF-03] Gestão de Funcionários Administrativos
**Endpoint:** `POST /api/funcionarios/` (Criação)

**Payload de Envio (Request):**
```json
{
  "nome_completo": "Ana Paula Souza",
  "cpf": "123.456.789-00",
  "cargo": "Assistente Técnico de Laboratório",
  "email": "ana.souza@instituicao.edu.br",
  "senha": "senha_temporaria_456"
}
```

**Payload de Retorno (Response) - Sucesso (201 Created):**
```json
{
  "id": "d4e5f6a7-b8c9-0123-4567-89abcdef0123",
  "nome_completo": "Ana Paula Souza",
  "cpf": "123.456.789-00",
  "cargo": "Assistente Técnico de Laboratório",
  "usuario_id": "e5f6a7b8-c9d0-1234-5678-9abcdef01234"
}
```

---

## [RF-04] Gestão de Categorias de Recursos
**Endpoint:** `POST /api/categorias/` (Criação)

**Payload de Envio (Request):**
```json
{
  "nome": "Datashow",
  "tempo_max_horas": 4,
  "requer_aprovacao": true
}
```

**Payload de Retorno (Response) - Sucesso (201 Created):**
```json
{
  "id": "f6a7b8c9-d0e1-2345-6789-abcdef012345",
  "nome": "Datashow",
  "tempo_max_horas": 4,
  "requer_aprovacao": true
}
```

---

## [RF-05] Gestão do Inventário Físico (Patrimônio)
**Endpoint:** `POST /api/equipamentos/` (Criação)

**Payload de Envio (Request):**
```json
{
  "num_patrimonio": "PAT-2024-001",
  "modelo": "Epson PowerLite S41",
  "status": "Disponivel",
  "categoria_id": "f6a7b8c9-d0e1-2345-6789-abcdef012345"
}
```

**Payload de Retorno (Response) - Sucesso (201 Created):**
```json
{
  "id": "a7b8c9d0-e1f2-3456-789a-bcdef0123456",
  "num_patrimonio": "PAT-2024-001",
  "modelo": "Epson PowerLite S41",
  "status": "Disponivel",
  "categoria_nome": "Datashow"
}
```

---

## [RF-06] Solicitação de Reserva (Visão Professor)
**Endpoint:** `POST /api/reservas/` (Criação do Carrinho)

**Payload de Envio (Request):**
```json
{
  "data_retirada": "2026-05-20T14:00:00Z",
  "data_devolucao": "2026-05-20T18:00:00Z",
  "equipamentos_ids": [
    "a7b8c9d0-e1f2-3456-789a-bcdef0123456",
    "b8c9d0e1-f2a3-4567-89ab-cdef01234567"
  ]
}
```

**Payload de Retorno (Response) - Sucesso (201 Created):**
```json
{
  "id": "c9d0e1f2-a3b4-5678-9abc-def012345678",
  "status": "Pendente",
  "data_retirada": "2026-05-20T14:00:00Z",
  "data_devolucao": "2026-05-20T18:00:00Z",
  "criado_em": "2026-05-19T18:40:00Z",
  "itens_reservados": 2
}
```

---

## [RF-07] Gestão de Reservas (Visão Administrativo)
**Endpoint:** `PATCH /api/reservas/{id_reserva}/triagem/` (Aprovação/Rejeição)

**Payload de Envio (Request):**
```json
{
  "status_novo": "Rejeitada",
  "justificativa": "Datashow principal foi enviado para manutenção hoje pela manhã."
}
```

**Payload de Retorno (Response) - Sucesso (200 OK):**
```json
{
  "id_historico": "d0e1f2a3-b4c5-6789-abcd-ef0123456789",
  "reserva_id": "c9d0e1f2-a3b4-5678-9abc-def012345678",
  "status_atualizado": "Rejeitada",
  "justificativa": "Datashow principal foi enviado para manutenção hoje pela manhã.",
  "data_acao": "2026-05-19T18:45:00Z"
}
```

---

## [RF-08] Registro de Retirada (Check-out)
**Endpoint:** `POST /api/reservas/{id_reserva}/checkout/`

**Payload de Envio (Request):**
```json
{
  "observacao_saida": "Entregue sem a maleta de transporte."
}
```

**Payload de Retorno (Response) - Sucesso (201 Created):**
```json
{
  "id_emprestimo": "e1f2a3b4-c5d6-789a-bcde-f01234567890",
  "reserva_id": "c9d0e1f2-a3b4-5678-9abc-def012345678",
  "data_retirada_real": "2026-05-20T13:55:00Z",
  "status_reserva_novo": "Em Andamento",
  "observacao_saida": "Entregue sem a maleta de transporte."
}
```

---

## [RF-09] Registro de Devolução (Check-in e Ocorrências)
**Endpoint:** `POST /api/emprestimos/{id_emprestimo}/checkin/`

**Payload de Envio (Request):**
```json
{
  "estado_conservacao": "Perfeito"
}
```

**Payload de Retorno (Response) - Sucesso (201 Created):**
```json
{
  "id_devolucao": "f2a3b4c5-d6e7-89ab-cdef-012345678901",
  "data_devolucao_real": "2026-05-20T17:50:00Z",
  "houve_atraso": false,
  "estado_conservacao": "Perfeito",
  "status_reserva_novo": "Concluída"
}
```

---

## [RF-10] Dashboard de Inventário em Tempo Real
**Endpoint:** `GET /api/dashboard/inventario/` (Apenas Retorno)

**Payload de Envio (Request):** *(Vazio / GET Request)*

**Payload de Retorno (Response) - Sucesso (200 OK):**
```json
{
  "total_equipamentos_ativos": 150,
  "equipamentos_em_uso": 42,
  "equipamentos_manutencao": 8,
  "reservas_atrasadas_hoje": 3,
  "grafico_uso_por_categoria": [
    { "categoria": "Notebook", "quantidade_em_uso": 25 },
    { "categoria": "Datashow", "quantidade_em_uso": 12 },
    { "categoria": "Cabo HDMI", "quantidade_em_uso": 5 }
  ]
}
```

---

## [RF-11] Relatório de Empréstimos e Atrasos
**Endpoint:** `GET /api/relatorios/emprestimos/?data_inicio=2026-05-01&data_fim=2026-05-31&apenas_com_atraso=true` 
*(Obs: Para exportação de PDF, a API retorna um binário `application/pdf`. O JSON abaixo representa a listagem paginada consumida pelo Front-end antes da exportação).*

**Payload de Retorno (Response Paginado) - Sucesso (200 OK):**
```json
{
  "count": 14,
  "next": "http://api.instituicao.edu.br/relatorios/emprestimos/?page=2",
  "previous": null,
  "results": [
    {
      "reserva_id": "c9d0e1f2-a3b4-5678-9abc-def012345678",
      "professor": "Carlos Roberto da Silva",
      "data_retirada_real": "2026-05-10T14:10:00Z",
      "data_devolucao_prevista": "2026-05-10T16:00:00Z",
      "data_devolucao_real": "2026-05-10T17:30:00Z",
      "minutos_atraso": 90
    }
  ]
}
```

---

## [RF-12] Sistema de Ocorrências e Manutenção
**Endpoint:** `POST /api/manutencoes/` (Abertura de Chamado)

**Payload de Envio (Request):**
```json
{
  "equipamento_id": "a7b8c9d0-e1f2-3456-789a-bcdef0123456",
  "descricao_defeito": "A lâmpada do datashow queimou durante a aula."
}
```

**Payload de Retorno (Response) - Sucesso (201 Created):**
```json
{
  "id_chamado": "a3b4c5d6-e7f8-90ab-cdef-123456789012",
  "equipamento": {
    "num_patrimonio": "PAT-2024-001",
    "status_novo": "Manutenção"
  },
  "status_chamado": "Aberto",
  "data_abertura": "2026-05-19T18:50:00Z",
  "descricao_defeito": "A lâmpada do datashow queimou durante a aula."
}
```
