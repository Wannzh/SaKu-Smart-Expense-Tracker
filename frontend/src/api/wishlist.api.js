import api from "./axios";

export const getWishlists = (params) =>
  api.get("/wishlists", { params });

export const getWishlistById = (id) =>
  api.get(`/wishlists/${id}`);

export const createWishlist = (formData) =>
  api.post("/wishlists", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateWishlist = (id, formData) =>
  api.put(`/wishlists/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const addWishlistSavings = (id, amount, walletId) =>
  api.post(`/wishlists/${id}/savings`, { amount, walletId });

export const deleteWishlist = (id) =>
  api.delete(`/wishlists/${id}`);
