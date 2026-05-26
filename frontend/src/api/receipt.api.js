import api from "./axios";

export const scanReceipt = (file) => {
  const formData = new FormData();
  formData.append("receipt", file);

  return api.post("/receipts/scan", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const confirmReceipt = (data) => api.post("/receipts/confirm", data);
