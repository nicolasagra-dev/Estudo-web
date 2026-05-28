# RF-19 - Agendamento de Bancas

Implementacao do requisito **Agendamento de Bancas (Data, Hora e Local)** para o Modulo 2.

## O que foi entregue

- Modelo Django `AgendamentoBanca`.
- Serializer com as duas regras de negocio do RF-19.
- ViewSet e rotas REST no padrao DRF.
- Tela React para cadastrar, listar e cancelar agendamentos.
- Service Axios para consumir o endpoint.

## Regras atendidas

1. A banca nao pode ser agendada se existir outro agendamento no mesmo `local_ou_link` com intervalo de horario sobreposto.
2. A banca so pode ser agendada quando o tema possui pelo menos um `ParecerOrientador` com `apto_banca = true`.
3. A data final deve ser posterior a data inicial.
4. Cada `TemaTcc` possui no maximo um `AgendamentoBanca`, usando relacionamento 1:1.

## Backend

Copie os arquivos de `backend/gestao_tcc/` para o app Django `gestao_tcc`.

Se o projeto ja tiver arquivos `models.py`, `serializers.py`, `views.py` e `urls.py`, copie apenas as classes e imports indicados, sem substituir o trabalho dos outros requisitos.

Depois rode:

```bash
python manage.py makemigrations gestao_tcc
python manage.py migrate
python manage.py test gestao_tcc
```

Endpoint principal:

```text
POST /api/bancas/agendamento/
GET /api/bancas/agendamento/
GET /api/bancas/agendamento/{id}/
PATCH /api/bancas/agendamento/{id}/
DELETE /api/bancas/agendamento/{id}/
```

Payload de criacao:

```json
{
  "tema_tcc_id": "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
  "data_hora_inicio": "2026-11-25T14:00:00Z",
  "data_hora_fim": "2026-11-25T16:00:00Z",
  "local_ou_link": "Sala de Defesas 102 - Bloco B"
}
```

## Frontend

Copie os arquivos de `frontend/src/` para o projeto React.

Rotas sugeridas:

```jsx
import AgendamentoBancaPage from "./pages/AgendamentoBancaPage";

<Route path="/bancas/agendamento" element={<AgendamentoBancaPage />} />
```

O service espera que ja exista um arquivo `src/services/api.js` exportando uma instancia Axios com `baseURL` apontando para `/api/`, conforme o tutorial do Modulo 2.
