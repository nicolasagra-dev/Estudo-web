# Contratos de API (Payloads JSON) - Módulo 2

Este documento define os contratos de dados esperados (estruturas JSON de Envio/Request e Retorno/Response) para os endpoints dos Requisitos Funcionais do **Módulo 2: Sistema de Gestão de TCC e Bancas**. 

As rotas seguem o padrão RESTful e as convenções do Django REST Framework (DRF).

---

## [RF-13] Autenticação e Cadastro de Alunos

### 1. Auto-cadastro do Aluno
**Endpoint:** `POST /api/alunos/cadastro/`

**Payload de Envio (Request):**
```json
{
  "nome_completo": "Lucas Andrade Pinheiro",
  "matricula": "202400987",
  "email": "lucas.pinheiro@estudante.edu.br",
  "senha": "senha_estudante_2026",
  "curso": "Engenharia de Software"
}
```

**Payload de Retorno (Response) - Sucesso (201 Created):**
```json
{
  "id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  "nome_completo": "Lucas Andrade Pinheiro",
  "matricula": "202400987",
  "email": "lucas.pinheiro@estudante.edu.br",
  "curso": "Engenharia de Software",
  "ativo": true
}
```

### 2. Login de Aluno
**Endpoint:** `POST /api/alunos/login/`

**Payload de Envio (Request):**
```json
{
  "email": "lucas.pinheiro@estudante.edu.br",
  "senha": "senha_estudante_2026"
}
```

**Payload de Retorno (Response) - Sucesso (200 OK):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxYTJiM2M0ZC...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzYjRjNWQ2...",
  "usuario": {
    "id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    "nome": "Lucas Andrade Pinheiro",
    "perfil": "Aluno"
  }
}
```

---

## [RF-14] Cadastro e Gestão de Temas de TCC
**Endpoint:** `POST /api/temas/`

**Payload de Envio (Request):**
```json
{
  "titulo": "Aplicação de Microsserviços Resilientes com Spring Boot e Kubernetes",
  "resumo": "Este trabalho analisa a implementação de padrões de resiliência como Circuit Breaker e Retry em uma arquitetura de microsserviços distribuídos."
}
```

**Payload de Retorno (Response) - Sucesso (201 Created):**
```json
{
  "id": "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
  "aluno_id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  "titulo": "Aplicação de Microsserviços Resilientes com Spring Boot e Kubernetes",
  "resumo": "Este trabalho analisa a implementação de padrões de resiliência como Circuit Breaker e Retry em uma arquitetura de microsserviços distribuídos.",
  "status": "Pendente",
  "data_submissao": "2026-05-19T19:00:00Z"
}
```

---

## [RF-15] Vinculação de Orientador e Aluno

### 1. Enviar Convite de Orientação (Visão Aluno)
**Endpoint:** `POST /api/orientacoes/convite/`

**Payload de Envio (Request):**
```json
{
  "tema_tcc_id": "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
  "docente_id": "9f8e7d6c-5b4a-3f2e-1d0c-9b8a7f6e5d4c"
}
```

**Payload de Retorno (Response) - Sucesso (201 Created):**
```json
{
  "id": "3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
  "tema_tcc_id": "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
  "docente_id": "9f8e7d6c-5b4a-3f2e-1d0c-9b8a7f6e5d4c",
  "status": "Pendente",
  "data_resposta": null
}
```

### 2. Responder Convite (Visão Professor)
**Endpoint:** `PATCH /api/orientacoes/responder/{id_convite}/`

**Payload de Envio (Request):**
```json
{
  "status": "Aceito"
}
```

**Payload de Retorno (Response) - Sucesso (200 OK):**
```json
{
  "id": "3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
  "tema_tcc_id": "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
  "docente_id": "9f8e7d6c-5b4a-3f2e-1d0c-9b8a7f6e5d4c",
  "status": "Aceito",
  "data_resposta": "2026-05-19T20:15:00Z"
}
```

---

## [RF-16] Linha do Tempo e Entregas (Milestones)
**Endpoint:** `POST /api/cronogramas/`

**Payload de Envio (Request):**
```json
{
  "titulo": "Entrega da Versão de Pré-Banca (PDF)",
  "data_inicio": "2026-10-01T08:00:00Z",
  "data_fim": "2026-10-15T23:59:59Z",
  "obrigatoria": true
}
```

**Payload de Retorno (Response) - Sucesso (201 Created):**
```json
{
  "id": "4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
  "titulo": "Entrega da Versão de Pré-Banca (PDF)",
  "data_inicio": "2026-10-01T08:00:00Z",
  "data_fim": "2026-10-15T23:59:59Z",
  "obrigatoria": true
}
```

---

## [RF-17] Repositório e Upload de Arquivos (Versões do TCC)
**Endpoint:** `POST /api/versoes/upload/`  

**Campos do Formulário (Request):**
* `tema_tcc_id`: `2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e`
* `arquivo`: `[Arquivo Binário PDF]`

**Payload de Retorno (Response) - Sucesso (201 Created):**
```json
{
  "id": "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
  "tema_tcc_id": "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
  "arquivo_url": "https://storage.instituicao.edu.br/tcc/versoes/2b3c4d5e_v1.pdf",
  "versao": 1,
  "data_envio": "2026-05-19T21:30:00Z"
}
```

---

## [RF-18] Módulo de Feedback e Parecer do Orientador
**Endpoint:** `POST /api/pareceres/`

**Payload de Envio (Request):**
```json
{
  "versao_id": "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
  "comentarios": "Excelente fundamentação teórica. Ajustar apenas a formatação das tabelas para a versão final.",
  "apto_banca": true
}
```

**Payload de Retorno (Response) - Sucesso (201 Created):**
```json
{
  "id": "6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c",
  "versao_id": "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
  "comentarios": "Excelente fundamentação teórica. Ajustar apenas a formatação das tabelas para a versão final.",
  "apto_banca": true,
  "data_parecer": "2026-05-19T22:00:00Z"
}
```

---

## [RF-19] Agendamento de Bancas (Data, Hora e Local)
**Endpoint:** `POST /api/bancas/agendamento/`

**Payload de Envio (Request):**
```json
{
  "tema_tcc_id": "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
  "data_hora_inicio": "2026-11-25T14:00:00Z",
  "data_hora_fim": "2026-11-25T16:00:00Z",
  "local_ou_link": "Sala de Defesas 102 - Bloco B"
}
```

**Payload de Retorno (Response) - Sucesso (201 Created):**
```json
{
  "id": "7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
  "tema_tcc_id": "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
  "data_hora_inicio": "2026-11-25T14:00:00Z",
  "data_hora_fim": "2026-11-25T16:00:00Z",
  "local_ou_link": "Sala de Defesas 102 - Bloco B"
}
```

---

## [RF-20] Composição da Banca Examinadora
**Endpoint:** `POST /api/bancas/membros/`

**Payload de Envio (Request):**
```json
{
  "agendamento_id": "7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
  "docente_id": "8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e",
  "papel": "Avaliador Interno"
}
```

**Payload de Retorno (Response) - Sucesso (201 Created):**
```json
{
  "id": "8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e",
  "agendamento_id": "7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
  "docente_id": "8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e",
  "papel": "Avaliador Interno",
  "confirmado": false
}
```

---

## [RF-21] Painel do Avaliador (Lançamento de Notas)
**Endpoint:** `POST /api/bancas/membros/{id_membro_banca}/avaliar/`

**Payload de Envio (Request):**
```json
{
  "nota_escrita": 9.50,
  "nota_apresentacao": 9.80,
  "comentarios": "A monografia está excelente e a desenvoltura técnica na apresentação foi ótima."
}
```

**Payload de Retorno (Response) - Sucesso (201 Created):**
```json
{
  "id": "9c0d1e2f-3a4b-5c6d-7e8f-9a0b1c2d3e4f",
  "membro_banca_id": "8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e",
  "nota_escrita": 9.50,
  "nota_apresentacao": 9.80,
  "comentarios": "A monografia está excelente e a desenvoltura técnica na apresentação foi ótima."
}
```

---

## [RF-22] Geração Automatizada da Ata de Defesa
**Endpoint:** `POST /api/bancas/{id_agendamento}/fechar-ata/`

**Payload de Envio (Request):** *(Vazio)*

**Payload de Retorno (Response) - Sucesso (200 OK):**
```json
{
  "id": "0d1e2f3a-4b5c-6d7e-8f9a-0b1c2d3e4f5a",
  "agendamento_id": "7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
  "media_final": 9.65,
  "resultado": "Aprovado",
  "data_emissao": "2026-11-25T16:30:00Z"
}
```

---

## [RF-23] Gestão de Professores (Orientadores) e Avaliadores Externos
**Endpoint:** `POST /api/docentes/`

**Payload de Envio (Request):**
```json
{
  "nome_completo": "Dr. Ricardo Menezes",
  "email": "ricardo.menezes@universidadeexterna.edu.br",
  "vinculo": "Externo",
  "instituicao": "Universidade Federal do Amazonas",
  "titulacao": "Doutor"
}
```

**Payload de Retorno (Response) - Sucesso (201 Created):**
```json
{
  "id": "9f8e7d6c-5b4a-3f2e-1d0c-9b8a7f6e5d4c",
  "nome_completo": "Dr. Ricardo Menezes",
  "email": "ricardo.menezes@universidadeexterna.edu.br",
  "vinculo": "Externo",
  "instituicao": "Universidade Federal do Amazonas",
  "titulacao": "Doutor"
}
```

---

## [RF-24] Dashboard de Acompanhamento (Visão Coordenação)
**Endpoint:** `GET /api/dashboard/coordenacao/`

**Payload de Retorno (Response) - Sucesso (200 OK):**
```json
{
  "total_alunos_sem_tema": 12,
  "temas_aguardando_aprovacao": 5,
  "bancas_agendadas_mes": 8,
  "taxa_aprovacao_semestre": 92.5
}
```

---

## [RF-25] Sistema de Notificações por E-mail / Alertas
**Endpoint:** `GET /api/notificacoes/`

**Payload de Retorno (Response) - Sucesso (200 OK):**
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "a3b4c5d6-e7f8-90ab-cdef-123456789012",
      "destinatario_email": "lucas.pinheiro@estudante.edu.br",
      "titulo": "Tema de TCC Aprovado",
      "mensagem": "Parabéns! Sua proposta de tema de TCC foi revisada e aprovada.",
      "lida": false,
      "data_envio": "2026-05-19T20:00:00Z"
    }
  ]
}
```
