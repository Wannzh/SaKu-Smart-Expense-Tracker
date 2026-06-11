import api from "./axios";

export const getRecurrings = (params) => api.get("/recurrings", { params });
export const getRecurringById = (id) => api.get(`/recurrings/${id}`);
export const createRecurring = (formData) =>
  api.post("/recurrings", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateRecurring = (id, formData) =>
  api.put(`/recurrings/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const toggleRecurringStatus = (id) => api.patch(`/recurrings/${id}/toggle`);
export const executeRecurring = (id) => api.post(`/recurrings/${id}/execute`);
export const deleteRecurring = (id) => api.delete(`/recurrings/${id}`);
