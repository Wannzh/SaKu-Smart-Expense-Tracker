import api from "./axios";

export const getTransfers = () => api.get("/transfers");

export const createTransfer = (data) => api.post("/transfers", data);

export const deleteTransfer = (id) => api.delete(`/transfers/${id}`);
