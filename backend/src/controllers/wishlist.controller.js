const wishlistService = require("../services/wishlist.service");
const { sendSuccess } = require("../utils/response");
const { uploadToCloudinary } = require("../utils/cloudinary");

/**
 * GET /api/wishlists
 * Get list of wishlists with optional status filter.
 */
const getWishlists = async (req, res, next) => {
  try {
    const { status } = req.query;
    const result = await wishlistService.getWishlists(req.user.id, { status });
    sendSuccess(res, 200, "Daftar keinginan berhasil diambil", result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/wishlists/:id
 * Get a single wishlist by ID.
 */
const getWishlistById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const wishlist = await wishlistService.getWishlistById(req.user.id, id);
    sendSuccess(res, 200, "Detail keinginan berhasil diambil", { wishlist });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/wishlists
 * Create a new wishlist item.
 */
const createWishlist = async (req, res, next) => {
  try {
    const { name, targetPrice, productLink, notes, targetDate } = req.body;
    
    let uploadedImageUrl = null;
    if (req.file) {
      uploadedImageUrl = await uploadToCloudinary(req.file.buffer, "wishlist");
    }

    const wishlist = await wishlistService.createWishlist(req.user.id, {
      name,
      targetPrice,
      imageUrl: uploadedImageUrl,
      productLink,
      notes,
      targetDate,
    });
    sendSuccess(res, 201, "Keinginan berhasil ditambahkan", { wishlist });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/wishlists/:id
 * Update a wishlist item.
 */
const updateWishlist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (req.file) {
      const uploadedImageUrl = await uploadToCloudinary(req.file.buffer, "wishlist");
      updateData.imageUrl = uploadedImageUrl;
    }

    const wishlist = await wishlistService.updateWishlist(req.user.id, id, updateData);
    sendSuccess(res, 200, "Keinginan berhasil diperbarui", { wishlist });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/wishlists/:id
 * Delete a wishlist item.
 */
const deleteWishlist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const wishlist = await wishlistService.deleteWishlist(req.user.id, id);
    sendSuccess(res, 200, "Keinginan berhasil dihapus", { wishlist });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/wishlists/:id/achieve
 * Mark a wishlist item as achieved.
 */
const markAsAchieved = async (req, res, next) => {
  try {
    const { id } = req.params;
    const wishlist = await wishlistService.markAsAchieved(req.user.id, id);
    sendSuccess(res, 200, "Keinginan berhasil ditandai sebagai tercapai", { wishlist });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlists,
  getWishlistById,
  createWishlist,
  updateWishlist,
  markAsAchieved,
  deleteWishlist,
};
