import api from "./axios";

export const getBills = (params) => 
  api.get("/bills", { params });
export const getBillById = (id) => 
  api.get(`/bills/${id}`);
export const createBill = (data) => 
  api.post("/bills", data);
export const updateBill = (id, data) => 
  api.put(`/bills/${id}`, data);
export const payBill = (id, data) => 
  api.patch(`/bills/${id}/pay`, data);
export const unpayBill = (id) => 
  api.patch(`/bills/${id}/unpay`);
export const deleteBill = (id) => 
  api.delete(`/bills/${id}`);
export const generateFromRecurring = (month, year) =>
  api.post("/bills/generate", { month, year });
