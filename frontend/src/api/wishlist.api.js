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

export const markWishlistAchieved = (id) =>
  api.patch(`/wishlists/${id}/achieve`);

export const deleteWishlist = (id) =>
  api.delete(`/wishlists/${id}`);
