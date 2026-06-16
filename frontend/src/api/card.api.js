import api from "./axios";

export const getCards = (params) => 
  api.get("/cards", { params });
export const getCardById = (id) => 
  api.get(`/cards/${id}`);
export const createCard = (data) => 
  api.post("/cards", data);
export const updateCard = (id, data) => 
  api.put(`/cards/${id}`, data);
export const togglePinToTop = (id) => 
  api.patch(`/cards/${id}/pin`);
export const deleteCard = (id) => 
  api.delete(`/cards/${id}`);
