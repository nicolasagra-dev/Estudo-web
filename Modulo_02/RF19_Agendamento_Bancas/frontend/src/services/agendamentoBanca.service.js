import api from "./api";

const RESOURCE = "bancas/agendamento/";

export async function listarAgendamentos(params = {}) {
  const { data } = await api.get(RESOURCE, { params });
  return data;
}

export async function criarAgendamento(payload) {
  const { data } = await api.post(RESOURCE, payload);
  return data;
}

export async function atualizarAgendamento(id, payload) {
  const { data } = await api.patch(`${RESOURCE}${id}/`, payload);
  return data;
}

export async function cancelarAgendamento(id) {
  await api.delete(`${RESOURCE}${id}/`);
}
