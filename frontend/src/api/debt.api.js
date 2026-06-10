import api from "./axios";

export const getDebts = (params) =>
  api.get("/debts", { params });

export const createDebt = (data) =>
  api.post("/debts", data);

export const updateDebt = (id, data) =>
  api.put(`/debts/${id}`, data);

export const payDebt = (id, data) =>
  api.patch(`/debts/${id}/pay`, data);

export const deleteDebt = (id) =>
  api.delete(`/debts/${id}`);
